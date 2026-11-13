import { wrap, type Remote } from 'comlink'
import type { TranslationService } from '../../workers/translation.worker'

let worker: Worker | null = null
let service: Remote<TranslationService> | null = null

export function getTranslationService(): Remote<TranslationService> {
  if (!service) {
    worker = new Worker(new URL('../../workers/translation.worker.ts', import.meta.url), { type: 'module' })
    service = wrap<TranslationService>(worker)
  }
  return service
}

