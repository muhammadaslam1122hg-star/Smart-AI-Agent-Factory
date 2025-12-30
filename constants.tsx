
import React from 'react';
import { AppView } from './types';

export const CATEGORIES = [
  { id: 'news', name: 'News & Media', icon: <i className="fa-solid fa-newspaper"></i> },
  { id: 'social', name: 'Social Media', icon: <i className="fa-solid fa-share-nodes"></i> },
  { id: 'website', name: 'Website Categories', icon: <i className="fa-solid fa-globe"></i> },
  { id: 'webapps', name: 'Web Apps', icon: <i className="fa-solid fa-laptop-code"></i> },
  { id: 'mobile', name: 'Mobile Apps', icon: <i className="fa-solid fa-mobile-screen"></i> },
  { id: 'tools', name: 'AI Tools', icon: <i className="fa-solid fa-microchip"></i> },
  { id: 'dev', name: 'Developer', icon: <i className="fa-solid fa-code"></i> },
  { id: 'business', name: 'Business AI', icon: <i className="fa-solid fa-briefcase"></i> },
  { id: 'edu', name: 'Education', icon: <i className="fa-solid fa-graduation-cap"></i> },
];

export const MAIN_FEATURES = [
  { id: AppView.WEBSITE_BUILDER, name: 'Website Builder', icon: <i className="fa-solid fa-globe"></i> },
  { id: AppView.WEB_APP_BUILDER, name: 'Web App Builder', icon: <i className="fa-solid fa-code"></i> },
  { id: AppView.MOBILE_APP_BUILDER, name: 'Mobile App Builder', icon: <i className="fa-solid fa-mobile-screen-button"></i> },
  { id: AppView.AI_AGENT_CREATOR, name: 'AI Agent Creator', icon: <i className="fa-solid fa-user-astronaut"></i> },
  { id: AppView.PHOTO_EDITING, name: 'Photo Editor', icon: <i className="fa-solid fa-wand-magic-sparkles"></i> },
  { id: AppView.BG_REMOVER, name: 'BG Remover', icon: <i className="fa-solid fa-scissors"></i> },
  { id: AppView.FACE_SWAP, name: 'Face Swap', icon: <i className="fa-solid fa-people-arrows"></i> },
  { id: AppView.IMAGE_GENERATION, name: 'Text to Image', icon: <i className="fa-solid fa-image"></i> },
  { id: AppView.VIDEO_GENERATION, name: 'Text to Video', icon: <i className="fa-solid fa-video"></i> },
  { id: AppView.IMAGE_TO_VIDEO, name: 'Image to Video', icon: <i className="fa-solid fa-film"></i> },
  { id: AppView.LIP_SYNC, name: 'Lip Sync AI', icon: <i className="fa-solid fa-lips"></i> },
];

export const SIDEBAR_ITEMS = [
  { id: AppView.HOME, name: 'Home', section: 'Builders', icon: <i className="fa-solid fa-house"></i> },
  { id: AppView.WEBSITE_BUILDER, name: 'Website Builder', section: 'Builders', icon: <i className="fa-solid fa-globe"></i> },
  { id: AppView.WEB_APP_BUILDER, name: 'Web App Builder', section: 'Builders', icon: <i className="fa-solid fa-code"></i> },
  { id: AppView.MOBILE_APP_BUILDER, name: 'Mobile App Builder', section: 'Builders', icon: <i className="fa-solid fa-mobile-screen"></i> },
  { id: AppView.AI_AGENT_CREATOR, name: 'AI Agent Creator', section: 'Builders', icon: <i className="fa-solid fa-user-astronaut"></i> },
  
  { id: AppView.IMAGE_GENERATION, name: 'Text to Image', section: 'Creative', icon: <i className="fa-solid fa-image"></i> },
  { id: AppView.PHOTO_EDITING, name: 'Photo Editing', section: 'Creative', icon: <i className="fa-solid fa-wand-magic-sparkles"></i> },
  { id: AppView.BG_REMOVER, name: 'BG Remover', section: 'Creative', icon: <i className="fa-solid fa-scissors"></i> },
  { id: AppView.FACE_SWAP, name: 'Face Swap', section: 'Creative', icon: <i className="fa-solid fa-people-arrows"></i> },
  
  { id: AppView.VIDEO_GENERATION, name: 'Text to Video', section: 'Motion', icon: <i className="fa-solid fa-video"></i> },
  { id: AppView.IMAGE_TO_VIDEO, name: 'Image to Video', section: 'Motion', icon: <i className="fa-solid fa-film"></i> },
  { id: AppView.LIP_SYNC, name: 'Lip Sync', section: 'Motion', icon: <i className="fa-solid fa-microphone-lines"></i> },

  { id: AppView.MY_PROJECTS, name: 'My Projects', section: 'Personal', icon: <i className="fa-solid fa-folder-tree"></i> },
];
