import { Vimeo } from "@vimeo/vimeo";
import { validateEnv } from "../config/env";
import {
  VimeoVideo,
  VimeoVideoFilters,
  VimeoVideoUpdate,
} from "../types/vimeo";

const env = validateEnv();
const vimeoClient = new Vimeo(
  env.VIMEO_CLIENT_ID,
  env.VIMEO_CLIENT_SECRET,
  env.VIMEO_ACCESS_TOKEN
);

export class VimeoService {
  private client: Vimeo;

  constructor() {
    this.client = vimeoClient;
  }

  async getVideos(filters: VimeoVideoFilters = {}): Promise<{
    total: number;
    page: number;
    per_page: number;
    paging: {
      next?: string;
      previous?: string;
      first: string;
      last: string;
    };
    data: VimeoVideo[];
  }> {
    try {
      const response = await new Promise((resolve, reject) => {
        this.client.request(
          {
            method: "GET",
            path: "/me/videos",
            query: filters,
          },
          (err, body) => {
            if (err) reject(err);
            resolve(body);
          }
        );
      });
      return response as any;
    } catch (error) {
      console.error("❌ Error al obtener videos:", error);
      throw error;
    }
  }

  async updateVideoPrivacy(
    videoId: string,
    update: VimeoVideoUpdate
  ): Promise<VimeoVideo> {
    try {
      const response = await new Promise((resolve, reject) => {
        this.client.request(
          {
            method: "PATCH",
            path: `/videos/${videoId}`,
            query: update,
          },
          (err, body) => {
            if (err) reject(err);
            resolve(body);
          }
        );
      });
      return response as VimeoVideo;
    } catch (error) {
      console.error("❌ Error al actualizar el video:", error);
      throw error;
    }
  }

  async setVideoEmbedOnly(videoId: string): Promise<VimeoVideo> {
    return this.updateVideoPrivacy(videoId, {
      privacy: {
        view: "disable",
        embed: "whitelist",
        download: false,
        add: false,
        comments: "nobody",
      },
    });
  }

  async setVideoPublic(videoId: string): Promise<VimeoVideo> {
    return this.updateVideoPrivacy(videoId, {
      privacy: {
        view: "anybody",
        embed: "public",
        download: false,
        add: false,
        comments: "nobody",
      },
    });
  }

  async getVideoById(videoId: string): Promise<VimeoVideo> {
    try {
      const response = await new Promise((resolve, reject) => {
        this.client.request(
          {
            method: "GET",
            path: `/videos/${videoId}`,
          },
          (err, body) => {
            if (err) reject(err);
            resolve(body);
          }
        );
      });
      return response as VimeoVideo;
    } catch (error) {
      console.error("❌ Error al obtener el video:", error);
      throw error;
    }
  }

  async isVideoEmbedOnly(videoId: string): Promise<boolean> {
    const video = await this.getVideoById(videoId);
    return (
      video.privacy.view === "disable" && video.privacy.embed === "whitelist"
    );
  }

  async getLatestVideo(): Promise<VimeoVideo | null> {
    return new Promise((resolve, reject) => {
      this.client.request(
        {
          method: "GET",
          path: "/me/videos",
          query: {
            per_page: 1,
            sort: "date",
            direction: "desc",
          },
        },
        (error, body) => {
          if (error) {
            reject(error);
            return;
          }

          const videos = body.data;
          if (!videos || videos.length === 0) {
            resolve(null);
            return;
          }

          resolve(videos[0]);
        }
      );
    });
  }
}
