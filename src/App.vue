<template>
  <div class="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 selection:bg-blue-500 selection:text-white">
    <router-view />
    <PwaInstallPrompt />
    <GlobalNotifications />
  </div>
</template>

<script setup>
import PwaInstallPrompt from './components/PwaInstallPrompt.vue'
import GlobalNotifications from './components/GlobalNotifications.vue'
</script>
