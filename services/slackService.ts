
import { Project, Task, SubTask } from '../types';

export const SlackService = {
  /**
   * Groups tasks by their Legend Category (Type).
   */
  groupTasksByCategory(tasks: Task[]): Record<string, Task[]> {
    return tasks.reduce((acc, task) => {
      const type = task.type || 'Uncategorized';
      if (!acc[type]) acc[type] = [];
      acc[type].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  },

  /**
   * Generates the Markdown content for a Slack Canvas based on a category of tasks.
   */
  generateCanvasContent(projectName: string, category: string, tasks: Task[]): string {
    // 1. Calculate Scope of Work Stats
    let totalAssets = tasks.length;
    let totalSubtasks = 0;
    tasks.forEach(t => totalSubtasks += t.subTasks.length);

    // 2. Build Header and Scope
    let content = `# ${projectName} - ${category}\n\n`;

    // Generic Scope of Work
    // e.g. "Install 34 Cameras, please check map for locations, etc..."
    const singularCategory = category.endsWith('s') ? category.slice(0, -1) : category;
    content += `**Scope of Work**: Install ${totalAssets} ${singularCategory}(s). Please check map for locations.\n\n`;

    content += `---\n\n`;

    // 3. Main Tasks Loop
    tasks.forEach(task => {
      // Main Task Checkbox
      const allDone = task.subTasks.length > 0 && task.subTasks.every(st => st.isCompleted);
      const parentCheck = allDone ? "[x]" : "[ ]";

      const displayName = task.name && task.name !== task.mapId
        ? `${task.mapId} - ${task.name}`
        : `${task.mapId} - ${task.type}`;

      content += `- ${parentCheck} **${displayName}**\n`;

      // Subtasks Loop - Flattened, no indentation
      task.subTasks.forEach(st => {
        const subCheck = st.isCompleted ? "[x]" : "[ ]";

        let subtaskLine = `- ${subCheck} ${st.details}`;
        if (st.productName && st.productName !== 'N/A') {
          subtaskLine += ` *(${st.productName})*`;
        }
        content += `${subtaskLine}\n`;
      });

      content += `\n`; // Spacer between main tasks
    });

    return content;
  },

  /**
   * Creates a Slack Canvas for a specific category.
   */
  async createCategoryCanvas(
    token: string,
    channelId: string,
    title: string,
    markdownContent: string,
    clientId?: string,
    clientSecret?: string
  ): Promise<any> {
    try {
      // NOTE: Using the `canvases.create` endpoint.
      // Requires `canvases:write` scope.

      // FIX for "Failed to Fetch":
      // 1. We encode the target URL to ensure safe passage through the proxy.
      // 2. We add Client ID / Secret to the body as requested (even though optional for this specific endpoint standardly).

      const proxyBase = "https://corsproxy.io/?";
      const targetUrl = "https://slack.com/api/canvases.create";

      // Construct the body, including client id/secret if present
      const body: any = {
        title: title,
        channel_id: channelId,
        document_content: {
          type: "markdown",
          markdown: markdownContent
        }
      };

      if (clientId) body.client_id = clientId;
      if (clientSecret) body.client_secret = clientSecret;

      // Ensure the URL is properly formatted for the proxy
      // corsproxy.io generally takes the url appended directly, but encoding helps with complex paths
      const response = await fetch(proxyBase + encodeURIComponent(targetUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body),
        keepalive: true // Helps with connection drops in loops
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || 'Failed to create canvas');
      }

      return data;
    } catch (error) {
      console.error("Slack API Error:", error);
      throw error;
    }
  },

  /**
   * Main orchestrator to sync a project to Slack.
   */
  async syncProjectToSlack(
    project: Project,
    token: string,
    clientId?: string,
    clientSecret?: string
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    if (!project.slackChannelId) {
      throw new Error("No Slack Channel ID assigned to this project.");
    }

    const groupedTasks = this.groupTasksByCategory(project.tasks);
    const categories = Object.keys(groupedTasks);

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const category of categories) {
      const tasks = groupedTasks[category];
      const title = `${project.name} - ${category}`;
      const content = this.generateCanvasContent(project.name, category, tasks);

      try {
        await this.createCategoryCanvas(token, project.slackChannelId, title, content, clientId, clientSecret);
        successCount++;
        // Add a small delay to avoid hitting Slack's rate limits (Tier 2 is 20/min)
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e: any) {
        console.error(`Sync error for ${category}:`, e);
        failCount++;
        errors.push(`Failed to sync ${category}: ${e.message}`);
      }
    }

    return { success: successCount, failed: failCount, errors };
  }
};
