import { validateEnv } from "../config/env";

const { WORDPRESS_CPT } = validateEnv();

export interface TrainerImages {
  image_1: number;
  image_2: number | false;
}

export interface DayTrainers {
  trainer_1: TrainerImages;
  trainer_2: TrainerImages;
  trainer_3: TrainerImages;
}

export interface CategoryInfo {
  term_id: number;
  name: string;
  slug: string;
  term_group: number;
  term_taxonomy_id: number;
  taxonomy: string;
  description: string;
  parent: number;
  count: number;
  filter: string;
}

export interface Category {
  term_id: number;
  name: string;
  slug: string;
}

export interface Trainer {
  name: string;
  image: string;
}

export interface DayConfig {
  category: Category;
  trainers: DayTrainers;
}

export interface VimeoWPConfig {
  config_day_1: DayConfig;
  config_day_2: DayConfig;
  config_day_3: DayConfig;
  config_day_4: DayConfig;
  config_day_5: DayConfig;
  config_day_6: DayConfig;
}

export interface WordPressPost {
  id?: number;
  date?: string;
  date_gmt?: string;
  guid?: {
    rendered: string;
  };
  modified?: string;
  modified_gmt?: string;
  slug?: string;
  status?: "publish" | "future" | "draft" | "pending" | "private";
  type?: typeof WORDPRESS_CPT;
  link?: string;
  title?: {
    rendered: string;
  };
  content?: {
    rendered: string;
    protected: boolean;
  };
  excerpt?: {
    rendered: string;
    protected: boolean;
  };
  author?: number;
  featured_media?: number;
  comment_status?: "open" | "closed";
  ping_status?: "open" | "closed";
  sticky?: boolean;
  template?: string;
  format?: string;
  meta?: Record<string, any>;
  categories?: number[];
  tags?: number[];
  acf?: Record<string, any>;
  categoria_de_clase_grabada?: number[];
}

export interface CreatePostData {
  title: string;
  content: string;
  status: "publish" | "draft";
  categoria_de_clase_grabada: number[];
  featured_media?: number;
  acf: {
    video_id: string;
    video_url: string;
    video_duration: number;
    day_number: number;
    trainers: string | string[];
  };
}

export interface UpdatePostData extends Partial<CreatePostData> {
  id: number;
}
