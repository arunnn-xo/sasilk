/**
 * Type-safe NodeNext test harness for Dynamic Storefront Intro Video
 */

import { z } from 'zod'

export interface IntroVideoConfig {
  enabled: boolean
  videoUrl: string
  posterUrl?: string
  skipEnabled: boolean
  skipAfterSeconds: number
  showOncePerSession: boolean
}

export const defaultIntroVideoConfig: IntroVideoConfig = {
  enabled: false,
  videoUrl: '',
  posterUrl: '',
  skipEnabled: true,
  skipAfterSeconds: 0,
  showOncePerSession: true,
}

export const introVideoSettingsSchema = z.object({
  key: z.string().min(1, 'Setting key is required.').max(120),
  value: z.record(z.any()),
}).superRefine((data, ctx) => {
  if (data.key === 'intro_video_config') {
    const val = data.value as any
    if (typeof val !== 'object' || val === null || Array.isArray(val)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'value must be a record object', path: ['value'] })
      return
    }
    if (typeof val?.enabled !== 'boolean') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'enabled must be a boolean', path: ['value', 'enabled'] })
    }
    if (val?.enabled && (!val.videoUrl || typeof val.videoUrl !== 'string' || !val.videoUrl.trim())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'videoUrl is required when intro video is enabled', path: ['value', 'videoUrl'] })
    }
    if (val?.videoUrl !== undefined && typeof val.videoUrl !== 'string') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'videoUrl must be a string', path: ['value', 'videoUrl'] })
    }
    if (val?.posterUrl !== undefined && val?.posterUrl !== null && typeof val.posterUrl !== 'string') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'posterUrl must be a string', path: ['value', 'posterUrl'] })
    }
    if (val?.skipEnabled !== undefined && typeof val.skipEnabled !== 'boolean') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'skipEnabled must be a boolean', path: ['value', 'skipEnabled'] })
    }
    if (val?.skipAfterSeconds !== undefined) {
      const num = Number(val.skipAfterSeconds)
      if (isNaN(num) || num < 0 || num > 30 || typeof val.skipAfterSeconds === 'boolean') {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'skipAfterSeconds must be a number between 0 and 30', path: ['value', 'skipAfterSeconds'] })
      }
    }
    if (val?.showOncePerSession !== undefined && typeof val.showOncePerSession !== 'boolean') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'showOncePerSession must be a boolean', path: ['value', 'showOncePerSession'] })
    }
  }
})

export function runContractSmokeCheck(): boolean {
  const parseResult = introVideoSettingsSchema.safeParse({
    key: 'intro_video_config',
    value: defaultIntroVideoConfig,
  })
  return parseResult.success
}
