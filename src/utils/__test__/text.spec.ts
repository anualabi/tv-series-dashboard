import { describe, expect, test } from 'vitest'

import { stripHtml } from '@/utils/text'

describe('stripHtml', () => {
  test('removes tags and trims whitespace', () => {
    expect(stripHtml('  <p>Hello</p>  ')).toBe('Hello')
  })

  test('handles nested/multiple tags', () => {
    expect(stripHtml('<div>Hello <strong>world</strong></div>')).toBe('Hello world')
  })

  test('returns empty string when only tags/whitespace', () => {
    expect(stripHtml(' \n <br><span></span> \t ')).toBe('')
  })

  test('leaves plain text unchanged (apart from trim)', () => {
    expect(stripHtml('  Hello  ')).toBe('Hello')
  })
})
