// Turns on base.css's smooth scrolling for in-page links once the app has hydrated. Until
// then a direct landing on a #hash, where the browser jumps to the section on its own,
// stays a jump (the router then puts the section at its scroll margin).
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hooks.hookOnce('app:suspense:resolve', () => {
    document.documentElement.classList.add('smooth-scroll')
  })
})
