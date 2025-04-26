export interface VimeoVideoFilters {
  page?: number;
  per_page?: number;
  query?: string;
  sort?:
    | "alphabetical"
    | "comments"
    | "date"
    | "default"
    | "duration"
    | "likes"
    | "modified_time"
    | "plays";
  direction?: "asc" | "desc";
  filter?: "embeddable" | "playable" | "purchasable";
  filter_embeddable?: boolean;
  filter_playable?: boolean;
  filter_purchasable?: boolean;
}

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
  created_time: string;
  modified_time: string;
  privacy: {
    view: string;
    embed: string;
    download: boolean;
  };
  pictures: {
    sizes: Array<{
      width: number;
      height: number;
      link: string;
    }>;
  };
}

export interface VimeoPrivacySettings {
  view?:
    | "anybody" // Publico
    | "contacts" // Contactos
    | "disable" // Ocultar de Vimeo
    | "nobody" // Privado
    | "password" // Contraseña
    | "unlisted" // Sin listar
    | "users"; // Usuarios
  embed?: "private" | "public" | "whitelist";
  download?: boolean;
  add?: boolean;
  comments?: "anybody" | "contacts" | "nobody";
}

export interface VimeoVideoUpdate {
  name?: string;
  description?: string;
  privacy?: VimeoPrivacySettings;
  password?: string;
  review_link?: boolean;
  embed?: {
    buttons?: {
      embed?: boolean;
      fullscreen?: boolean;
      hd?: boolean;
      like?: boolean;
      share?: boolean;
      watchlater?: boolean;
    };
    logos?: {
      vimeo?: boolean;
      custom?: {
        active?: boolean;
        link?: string;
        sticky?: boolean;
      };
    };
    title?: {
      name?: "hide" | "show" | "user";
      owner?: "hide" | "show" | "user";
      portrait?: "hide" | "show" | "user";
    };
  };
}

export type VimeoEventType =
  | "video.upload.complete" // Video subido
  | "video.transcode.complete" // Video transcodificado
  | "video.privacy.update" // Privacidad actualizada
  | "video.delete" // Video eliminado
  | "video.like.add" // Video likeado
  | "video.like.remove"; // Like removido

export interface VimeoWebhook {
  uri: string;
  active: boolean;
  created_time: string;
  modified_time: string;
  events: {
    [key in VimeoEventType]?: boolean;
  };
  callback_url: string;
  secret: string;
}
