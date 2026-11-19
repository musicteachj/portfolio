import { site } from '~/data/site'

// The Email links render as /contact on the server and during hydration, so the
// address is never in the generated output. Once mounted, they become mailto links.
export function useEmailHref(): Readonly<Ref<string>> {
  const href = ref('/contact')
  onMounted(() => {
    href.value = `mailto:${site.emailUser}@${site.emailDomain}`
  })
  return readonly(href)
}
