
export enum AppView {
  HOME = 'home',
  WEBSITE_BUILDER = 'website_builder',
  WEB_APP_BUILDER = 'web_app_builder',
  MOBILE_APP_BUILDER = 'mobile_app_builder',
  AI_TOOLS = 'ai_tools',
  AI_CHAT = 'ai_chat',
  AI_AGENT_CREATOR = 'ai_agent_creator',
  IMAGE_GENERATION = 'image_generation',
  VIDEO_GENERATION = 'video_generation',
  LOGO_ART = 'logo_art',
  AI_QA = 'ai_qa',
  PHOTO_EDITING = 'photo_editing',
  BG_REMOVER = 'bg_remover',
  FACE_SWAP = 'face_swap',
  IMAGE_TO_VIDEO = 'image_to_video',
  LIP_SYNC = 'lip_sync',
  MY_PROJECTS = 'my_projects'
}

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL: string;
}

export interface ProjectData {
  id?: string;
  title: string;
  feature: AppView;
  category: string;
  description: string;
  code?: string;
  createdAt: number;
  ownerId?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  attachment?: string;
}

export interface GeneratedAsset {
  type: 'image' | 'video' | 'code' | 'text';
  content: string;
  metadata?: any;
}
