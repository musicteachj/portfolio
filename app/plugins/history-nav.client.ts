// Tells pages whether the current navigation is a Back/Forward move, so they can keep
// browser-like focus on history moves and only move focus on new navigations.
export default defineNuxtPlugin(() => {
  const router = useRouter()
  let popPending = false
  let fromHistory = false
  // Called synchronously on popstate, before that navigation's guards run.
  router.options.history.listen(() => {
    popPending = true
  })
  router.beforeEach(() => {
    fromHistory = popPending
    popPending = false
  })
  return { provide: { isHistoryNav: () => fromHistory } }
})
