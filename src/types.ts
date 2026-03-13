export interface Link {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  url: string;
  sort_order: number;
  active: boolean;
}

export interface Settings {
  profile_name: string;
  profile_username: string;
  profile_image: string;
  bg_color: string;
  button_color: string;
  text_color: string;
}

export interface AnalyticsData {
  title: string;
  clicks: number;
}
