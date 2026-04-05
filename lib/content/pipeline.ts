import { extractContent } from './extractor'
import { transformContent } from './transformer'
import { ContentSource, ExtractedContent, TransformedContent } from './types'

export async function runContentPipeline(source: ContentSource): Promise<{
  extracted: ExtractedContent
  transformed: TransformedContent
}> {
  const extracted = await extractContent(source)
  const transformed = await transformContent(extracted)

  return { extracted, transformed }
}
