<template>
  <div>
    <a class="skip" href="#main">Skip to content</a>
    <SiteHeader />
    <main id="main" tabindex="-1"><slot /></main>
    <SiteFooter />
  </div>
</template>
