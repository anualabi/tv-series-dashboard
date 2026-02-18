import { describe, expect, test } from 'vitest'
import { nextTick } from 'vue'

import ShowCard from '@/components/ShowCard.vue'
import type { Show } from '@/types'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { makeShow } from '@/__data__/show'

const mountCard = (show: Show) =>
  mount(ShowCard, {
    props: { show },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })

describe('ShowCard', () => {
  test('renders type, name and formatted rating (with aria)', () => {
    const wrapper = mountCard(
      makeShow({ type: 'Reality', name: 'Top Gear', rating: { average: 7.997 } }),
    )

    expect(wrapper.get('.type').text()).toBe('Reality')
    expect(wrapper.get('.name').text()).toBe('Top Gear')

    const rating = wrapper.get('.rating')
    expect(rating.text()).toContain('★ 8.0')
    expect(rating.attributes('aria-label')).toBe('Rating 8.0')
  })

  test('renders em dash + "No rating" when rating missing', () => {
    const wrapper = mountCard(makeShow({ rating: { average: null } }))

    const rating = wrapper.get('.rating')
    expect(rating.text()).toContain('★ —')
    expect(rating.attributes('aria-label')).toBe('No rating')
  })

  test('renders image when available; falls back on error; recovers on src change', async () => {
    const wrapper = mountCard(makeShow({ image: { medium: 'https://cdn/a.jpg', original: 'x' } }))

    expect(wrapper.get('img').attributes('src')).toBe('https://cdn/a.jpg')

    await wrapper.get('img').trigger('error')
    await nextTick()

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.get('.thumb-fallback').text()).toBe('No image')

    await wrapper.setProps({
      show: makeShow({ image: { medium: 'https://cdn/b.jpg', original: 'y' } }),
    })
    await nextTick()

    expect(wrapper.get('img').attributes('src')).toBe('https://cdn/b.jpg')
  })

  test('renders fallback when image is missing', () => {
    const wrapper = mountCard(makeShow({ image: null }))

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.get('.thumb-fallback').attributes('aria-hidden')).toBe('true')
  })
})
