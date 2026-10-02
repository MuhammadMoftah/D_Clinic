// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: true },
  css: [
    "@/assets/css/tailwind.css",
  ],
  components: [
    // Register all components without directory-name prefix
    // so AppStatCard, AppCard, AppButton, etc. work without "Data" / "Ui" prefix
    { path: '~/components', pathPrefix: false },
  ],
  app: {
    head: {
      title: 'Dr. Dalia Clinic',
      meta: [
        { name: 'description', content: 'Dr. Dalia Clinic — Premium Medical Clinic Management System' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
        },
      ],
    },
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})
