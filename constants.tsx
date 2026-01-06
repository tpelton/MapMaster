
import React from 'react';
import { LegendTemplate } from './types';

export const INITIAL_LEGEND_TEMPLATES: LegendTemplate[] = [
  {
    id: '1',
    label: 'Speaker',
    icon: 'Speaker',
    matchKeys: ['SP', 'S'],
    baseSubTasks: [
      { category: 'Speaker', taskType: 'Pre-Wire', details: 'Rough-in backbox and cabling', productName: '16/2 Oxygen Free Audio Cable' },
      { category: 'Speaker', taskType: 'Trim', details: 'Install mounting bracket', productName: 'Universal Bracket B1' },
      { category: 'Speaker', taskType: 'Install', details: 'Final installation and trim', productName: 'In-Ceiling 6.5" Speaker' },
      { category: 'Speaker', taskType: 'Program', details: 'Sound calibration and testing', productName: 'N/A' }
    ]
  },
  {
    id: '2',
    label: 'Data Jacks',
    icon: 'Network',
    matchKeys: ['D', 'DATA'],
    baseSubTasks: [
      { category: 'Data Jacks', taskType: 'Pre-Wire', details: 'Pull CAT6 cable to location', productName: 'CAT6 Blue Plenum' },
      { category: 'Data Jacks', taskType: 'Trim', details: 'Terminate and label jack', productName: 'RJ45 Keystone Jack' },
      { category: 'Data Jacks', taskType: 'Install', details: 'Test connectivity and certify', productName: 'N/A' }
    ]
  },
  {
    id: '3',
    label: 'TV',
    icon: 'Monitor',
    matchKeys: ['TV', 'DISP'],
    baseSubTasks: [
      { category: 'TV', taskType: 'Pre-Wire', details: 'Install wall mount reinforcement', productName: 'Plywood Backing' },
      { category: 'TV', taskType: 'Install', details: 'Mount TV and conceal wires', productName: 'Sanus VLF728-B2' },
      { category: 'TV', taskType: 'Program', details: 'Configure smart features', productName: 'N/A' }
    ]
  },
  {
    id: '4',
    label: 'In-Wall WAP',
    icon: 'Wifi',
    matchKeys: ['AP', 'WAP'],
    baseSubTasks: [
      { category: 'In-Wall WAP', taskType: 'Pre-Wire', details: 'Install single gang ring', productName: 'Low Voltage Ring' },
      { category: 'In-Wall WAP', taskType: 'Install', details: 'Terminate and mount WAP', productName: 'Unifi U6-In-Wall' },
      { category: 'In-Wall WAP', taskType: 'Program', details: 'Adopt and configure in controller', productName: 'N/A' }
    ]
  },
  {
    id: '5',
    label: 'Camera',
    icon: 'Camera',
    matchKeys: ['C', 'CAM'],
    baseSubTasks: [
      { category: 'Camera', taskType: 'Pre-Wire', details: 'Cabling and PoE connection', productName: 'CAT6' },
      { category: 'Camera', taskType: 'Install', details: 'Mount camera and adjust FOV', productName: 'IP Security Camera' },
      { category: 'Camera', taskType: 'Program', details: 'NVR integration and testing', productName: 'N/A' }
    ]
  },
  {
    id: '6',
    label: 'Contact Sensor',
    icon: 'DoorOpen',
    matchKeys: ['CS', 'CONT'],
    baseSubTasks: [
      { category: 'Contact Sensor', taskType: 'Install', details: 'Mount sensor and magnet', productName: 'Wireless Contact' },
      { category: 'Contact Sensor', taskType: 'Program', details: 'Pair with security panel', productName: 'Security Hub' },
      { category: 'Contact Sensor', taskType: 'Single', details: 'Operational trigger test', productName: 'N/A' }
    ]
  },
  {
    id: '7',
    label: 'AV Touchscreen',
    icon: 'Tablet',
    matchKeys: ['TS', 'TP'],
    baseSubTasks: [
      { category: 'AV Touchscreen', taskType: 'Pre-Wire', details: 'Rough-in wall box', productName: 'Mounting Plate' },
      { category: 'AV Touchscreen', taskType: 'Install', details: 'Connect network and mount', productName: 'Touch Panel 10"' },
      { category: 'AV Touchscreen', taskType: 'Program', details: 'Upload UI and sync project', productName: 'N/A' }
    ]
  },
  {
    id: '8',
    label: 'Motion Detector',
    icon: 'Scan',
    matchKeys: ['MD', 'MOT'],
    baseSubTasks: [
      { category: 'Motion Detector', taskType: 'Install', details: 'Mount at optimal height', productName: 'PIR Motion Sensor' },
      { category: 'Motion Detector', taskType: 'Program', details: 'Walk test and calibration', productName: 'N/A' }
    ]
  },
  {
    id: '9',
    label: 'Glass Break',
    icon: 'Hammer',
    matchKeys: ['GB', 'GLASS'],
    baseSubTasks: [
      { category: 'Glass Break', taskType: 'Install', details: 'Mount near protected glass', productName: 'Acoustic GB Sensor' },
      { category: 'Glass Break', taskType: 'Program', details: 'Frequency response test', productName: 'GB Simulator' }
    ]
  },
  {
    id: '10',
    label: 'Cell Booster',
    icon: 'Signal',
    matchKeys: ['CB', 'CELL'],
    baseSubTasks: [
      { category: 'Cell Booster', taskType: 'Pre-Wire', details: 'Mount external donor antenna', productName: 'Yagi Antenna' },
      { category: 'Cell Booster', taskType: 'Install', details: 'Install amplifier and internal dome', productName: 'Signal Booster Pro' },
      { category: 'Cell Booster', taskType: 'Program', details: 'Measure dBi gain', productName: 'N/A' }
    ]
  },
  {
    id: '11',
    label: 'Alarm Keypad',
    icon: 'Keyboard',
    matchKeys: ['KP', 'KEY'],
    baseSubTasks: [
      { category: 'Alarm Keypad', taskType: 'Pre-Wire', details: 'Rough-in and bus wiring', productName: '18/4 Shielded' },
      { category: 'Alarm Keypad', taskType: 'Program', details: 'Mount and program zone codes', productName: 'LCD Keypad' }
    ]
  },
  {
    id: '12',
    label: 'VOIP Phone',
    icon: 'Phone',
    matchKeys: ['PH', 'PHONE'],
    baseSubTasks: [
      { category: 'VOIP Phone', taskType: 'Pre-Wire', details: 'Cabling and jack termination', productName: 'CAT6' },
      { category: 'VOIP Phone', taskType: 'Program', details: 'Provision and SIP config', productName: 'IP Desk Phone' }
    ]
  },
  {
    id: '13',
    label: 'Shades',
    icon: 'Blinds',
    matchKeys: ['SH', 'SHADE'],
    baseSubTasks: [
      { category: 'Shades', taskType: 'Pre-Wire', details: 'Run low-voltage power to window pocket', productName: '16/2 CMP' },
      { category: 'Shades', taskType: 'Trim', details: 'Install mounting brackets and cassette', productName: 'Shade Brackets' },
      { category: 'Shades', taskType: 'Install', details: 'Mount shade roller and terminate power', productName: 'Motorized Roller Shade' },
      { category: 'Shades', taskType: 'Program', details: 'Set limits and integrate with control system', productName: 'N/A' }
    ]
  },
  {
    id: 'custom',
    label: 'Custom',
    icon: 'Box',
    matchKeys: [], // No automatic matching
    baseSubTasks: [] // No default workflow steps
  }
];

export const MOCK_OCR_INPUT = `
LEGEND
Data Jacks
In-Wall WAP
Speaker
TV
Camera
Contact Sensor
AV Touchscreen
Motion Detector
Glass Break
Cell Booster
Alarm Keypad
VOIP Phone
Shades
...
AP1 PH1 D1/2-108 D3-108 D108-1/2 AP3 PH4 D4 PH3 D2 D3 AP4 AP5 AP6 AP2 PH6 PH7 PH8 PH9 PH2 D5 D8 D9 D17 D18 D14/15 D12 D13 D7 PH5 D19 D10 D11 S2 TV2 TV3 TV1A-B ES1 ES2 ES3 ES4 ES5 ES6 ES7 ES8 ES9 ES10 ES11 TV1 S1 GB MD C1 C2 C3 CS1 CS2 TS1 TS2 MD1 GB1 CB1 KP1 PH1 SH1 SH2 SH03 SH4
`;

export const TASK_TYPE_OPTIONS = ['Pre-Wire', 'Trim', 'Install', 'Program', 'Single'];
