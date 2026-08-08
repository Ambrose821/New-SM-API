import axios from "axios"
import { Post } from "../../../types"
import { getMetaErrorDetails } from "./instagramAuth"
import { access } from "fs"
import { decryptValue } from "../../../security/encryption"
const base_graph_url = `https://graph.instagram.com/v${process.env.GRAPH_API_VERSION}/`

const buildCaption = (post: Post) => {
  const baseCaption = post.description ?? post.headline
  const attributionLines = [
    ...(post.imageAttributions ?? []),
    ...(post.videoAttributions ?? []),
    ...(post.audioAttributions ?? []),
  ]
    .map(String)
    .filter(Boolean)

  return [String(baseCaption), ...attributionLines].join("\n").trim()
}

const getPrimaryMedia = (post: Post) => {
  if (post.mediaType === "Video") {
    if (!post.videoUrl) {
      throw new Error("Post mediaType is Video but videoUrl is missing.")
    }

    return {
      mediaType: "REELS" as const,
      mediaUrl: String(post.videoUrl),
      fieldName: "video_url" as const,
    }
  }

  if (!post.thumbnailUrl) {
    throw new Error("Post mediaType is Image but thumbnailUrl is missing.")
  }

  return {
    mediaType: "IMAGE" as const,
    mediaUrl: String(post.thumbnailUrl),
    fieldName: "image_url" as const,
  }
}

const isVideoUrl = (mediaUrl: string) => {
  const normalized = mediaUrl.toLowerCase()
  return [".mp4", ".mov", ".m4v", ".webm"].some((extension) => normalized.includes(extension))
}

const getMediaFromUrl = (mediaUrl: string) => {
  if (isVideoUrl(mediaUrl)) {
    return {
      mediaType: "REELS" as const,
      mediaUrl,
      fieldName: "video_url" as const,
    }
  }

  return {
    mediaType: "IMAGE" as const,
    mediaUrl,
    fieldName: "image_url" as const,
  }
}

const getMediaArrayFromPost = (post: Post) => {
  const { mediaUrl } = getPrimaryMedia(post)
  return [mediaUrl]
}

const single_media_post_to_instagram = async (
  instagram_id: string,
  access_token: string,
  post: Post,
  mediaUrlOverride?: string
) => {
  const creation_id = await get_instagram_creation_id(instagram_id, access_token, post, {
    mediaUrlOverride,
  })
  return instagram_upload(instagram_id, access_token, creation_id)
}

const get_instagram_creation_id = async (
  instagram_id: string,
  access_token: string,
  post: Post,
  options?: { isCarouselItem?: boolean; mediaUrlOverride?: string }
) => {
  const media = options?.mediaUrlOverride
    ? getMediaFromUrl(options.mediaUrlOverride)
    : getPrimaryMedia(post)
  const { mediaType, mediaUrl, fieldName } = media

  const params =
    mediaType === "REELS"
      ? {
          access_token,
          ...(options?.isCarouselItem ? {} : { caption: buildCaption(post) }),
          ...(options?.isCarouselItem ? { is_carousel_item: true } : {}),
          media_type: mediaType,
          [fieldName]: mediaUrl,
        }
      : {
          access_token,
          ...(options?.isCarouselItem ? {} : { caption: buildCaption(post) }),
          ...(options?.isCarouselItem ? { is_carousel_item: true } : {}),
          [fieldName]: mediaUrl,
        }

  const response = await axios.post(`${base_graph_url}${instagram_id}/media`, null, {
    params,
  })

  return response.data.id as string
}

const get_instagram_creation_id_status = async (creation_id: string, access_token: string) => {
  const response = await axios.get(`${base_graph_url}${creation_id}`, {
    params: { access_token, fields: "status_code,status" },
  })

  if (response.data.status_code === "ERROR") {
    console.log("Instagram Creation ID Container Error:", response.data)
  }

  return response.data.status_code as string
}

const creation_id_wait_for_ready = async (creation_id: string, access_token: string) => {
  let status: string | null = null
  let counter = 0

  while (status !== "FINISHED" && status !== "ERROR") {
    status = await get_instagram_creation_id_status(creation_id, access_token)
    console.log("Checked:", ++counter)

    if (status === "FINISHED" || status === "ERROR") {
      return status
    }

    await new Promise((resolve) => setTimeout(resolve, 5000))
  }

  return status
}

const instagram_upload = async (insta_id: string, access_token: string, creation_id: string) => {
  const creation_id_ready = await creation_id_wait_for_ready(creation_id, access_token)

  if (creation_id_ready !== "FINISHED") {
    throw new Error(`Creation id was not ready for publish. Status: ${creation_id_ready}`)
  }

  const response = await axios.post(`${base_graph_url}${insta_id}/media_publish`, null, {
    params: {
      access_token,
      creation_id,
    },
  })

  console.log("Instagram Post Success:", response.data)
  return response.data
}

const get_carousel_creation_ids_string = async (
  instagram_id: string,
  access_token: string,
  media_arr: string[],
  post: Post
) => {
  const creation_ids = await Promise.all(
    media_arr.map((mediaUrl) =>
      get_instagram_creation_id(instagram_id, access_token, post, {
        isCarouselItem: true,
        mediaUrlOverride: mediaUrl,
      })
    )
  )

  for (const creation_id of creation_ids) {
    const creation_id_ready = await creation_id_wait_for_ready(creation_id, access_token)
    if (creation_id_ready !== "FINISHED") {
      throw new Error(`Creation id was not ready for carousel publish. Status: ${creation_id_ready}`)
    }
  }

  return creation_ids.join(",")
}

const get_carousel_container = async (
  instagram_id: string,
  access_token: string,
  post: Post,
  creation_ids_string: string
) => {
  const response = await axios.post(`${base_graph_url}${instagram_id}/media`, null, {
    params: {
      access_token,
      caption: buildCaption(post),
      media_type: "CAROUSEL",
      children: creation_ids_string,
    },
  })

  return response.data.id as string
}

const carousel_post_to_instagram = async (
  instagram_id: string,
  access_token: string,
  media_arr: string[],
  post: Post
) => {
  const creation_ids_string = await get_carousel_creation_ids_string(instagram_id, access_token, media_arr, post)
  const carousel_container_id = await get_carousel_container(instagram_id, access_token, post, creation_ids_string)
  return instagram_upload(instagram_id, access_token, carousel_container_id)
}

export const post_to_instagram = async (
  instagram_id: string,
  access_token: string,
  post: Post,
  media_arr?: string[],
) => {
  try {
    const media_urls = media_arr && media_arr.length > 0 ? media_arr : getMediaArrayFromPost(post)
    const post_data =
      media_urls.length > 1
        ? await carousel_post_to_instagram(instagram_id, access_token, media_urls, post)
        : await single_media_post_to_instagram(instagram_id, access_token, post, media_urls[0])

    return { success: true, post_data }
  } catch (err) {
    const details = getMetaErrorDetails(err)
    console.error("Error in post to instagram:", details)
    return { success: false, post_data: details}
  }
}
