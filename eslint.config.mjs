import withNuxt from './.nuxt/eslint.config.mjs'
import prettier from 'eslint-config-prettier'

export default withNuxt(prettier, {
  // Build-time linkChecker.failOnError checks the real prerendered routes, aliases included.
  rules: {
    'link-checker/valid-route': 'off',
  },
}, {
  // Vue 3 fragments are fine here; no page transitions are configured, and an extra wrapper div would add nothing semantic.
  files: ['app/pages/index.vue'],
  rules: { 'vue/no-multiple-template-root': 'off' },
})
