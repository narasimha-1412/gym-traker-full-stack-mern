import { AppConfig } from '../models/AppConfig.js'
import { sendSuccess } from '../utils/apiResponse.js'

export async function getConfig(req, res, next) {
  try {
    const config = await AppConfig.ensureDefaults()
    sendSuccess(res, { config: config.toSafeJSON() })
  } catch (err) {
    next(err)
  }
}

export async function updateConfig(req, res, next) {
  try {
    const config = await AppConfig.ensureDefaults()
    const nextLimits = AppConfig.normalizeLimits(req.body)
    Object.assign(config, nextLimits)
    await config.save()
    sendSuccess(res, { config: config.toSafeJSON() })
  } catch (err) {
    next(err)
  }
}
