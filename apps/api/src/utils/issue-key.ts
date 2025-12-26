import { db } from '../db/index.js'
import { products } from '../db/schema.js'
import { eq, sql } from 'drizzle-orm'

/**
 * Generate a new issue key for a product (e.g., TSKLTS-001)
 * Atomically increments the product's nextIssueNum
 */
export async function generateIssueKey(productId: number): Promise<string> {
  // Atomic increment and return of next_issue_num
  const [product] = await db.update(products)
    .set({ nextIssueNum: sql`${products.nextIssueNum} + 1` })
    .where(eq(products.id, productId))
    .returning({ code: products.code, issueNum: products.nextIssueNum })

  if (!product || !product.code) {
    throw new Error(`Product ${productId} not found or has no code`)
  }

  // issueNum is already incremented, so we use issueNum - 1 for the current issue
  const issueNum = (product.issueNum ?? 1) - 1
  return `${product.code}-${String(issueNum).padStart(3, '0')}`
}
