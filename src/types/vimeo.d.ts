export interface VimeoVideo {
  uri: string;
  name: string;
  description: string;
  link: string;
  duration: number;
  width: number;
  height: number;
  embed: {
    html: string;
  };
  privacy: {
    view: string;
    embed: string;
    download: boolean;
    add: boolean;
    comments: string;
  };
  created_time: string;
  modified_time: string;
  release_time: string;
  status: string;
  pictures: {
    uri: string;
    active: boolean;
    type: string;
    sizes: Array<{
      width: number;
      height: number;
      link: string;
    }>;
  };
}

export interface VimeoVideoFilters {
  page?: number;
  per_page?: number;
  query?: string;
  filter?: string;
  filter_embeddable?: boolean;
  sort?: string;
  direction?: string;
}

export interface VimeoVideoUpdate {
  privacy?: {
    view?: string;
    embed?: string;
    download?: boolean;
    add?: boolean;
    comments?: string;
  };
  name?: string;
  description?: string;
  password?: string;
}
