<template>
  <div
    :class="[
      'flex items-center gap-3.5 p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs transition-all select-none',
      clickable ? 'cursor-pointer hover:bg-slate-50/80 active:scale-[0.99] active:bg-slate-100/80' : ''
    ]"
    @click="handleClick"
  >
    <!-- Leading: Avatar / Icon / Thumbnail -->
    <div class="shrink-0">
      <slot name="leading">
        <div v-if="avatarUrl" class="w-11 h-11 rounded-full overflow-hidden border border-slate-200 shadow-2xs">
          <img :src="avatarUrl" class="w-full h-full object-cover" />
        </div>
        <div v-else-if="initials" class="w-11 h-11 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center border border-blue-700 shadow-2xs">
          {{ initials }}
        </div>
        <div v-else-if="icon" class="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
          <span class="material-icons text-xl">{{ icon }}</span>
        </div>
      </slot>
    </div>

    <!-- Center: Title & Subtitles -->
    <div class="flex-1 min-w-0 pr-1">
      <div class="flex items-center gap-2">
        <h4 class="text-sm font-bold text-slate-900 leading-snug break-words line-clamp-1">
          {{ title }}
        </h4>
        <slot name="title-extra" />
      </div>

      <p v-if="subtitle" class="text-xs text-slate-500 mt-0.5 font-normal leading-relaxed break-words line-clamp-2">
        {{ subtitle }}
      </p>

      <p v-if="extra" class="text-[11px] text-slate-400 mt-0.5 leading-normal break-words line-clamp-2">
        {{ extra }}
      </p>
    </div>

    <!-- Trailing: Badge, Metadata & Chevron -->
    <div class="shrink-0 flex items-center gap-2">
      <slot name="trailing">
        <span
          v-if="badge"
          :class="['px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap capitalize border', badgeClasses]"
        >
          {{ badge }}
        </span>
      </slot>

      <span v-if="showChevron" class="material-icons text-slate-300 text-lg">
        chevron_right
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  extra: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  initials: { type: String, default: '' },
  icon: { type: String, default: '' },
  badge: { type: String, default: '' },
  badgeVariant: {
    type: String,
    default: 'default',
    validator: v => ['default', 'success', 'warning', 'danger', 'info', 'primary'].includes(v)
  },
  showChevron: { type: Boolean, default: true },
  clickable: { type: Boolean, default: true }
})

const emit = defineEmits(['click', 'tap'])

function handleClick(e) {
  if (props.clickable) {
    emit('click', e)
    emit('tap', e)
  }
}

const badgeClasses = computed(() => {
  switch (props.badgeVariant) {
    case 'success':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'warning':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'danger':
      return 'bg-rose-50 text-rose-700 border-rose-200'
    case 'info':
    case 'primary':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200'
  }
})
</script>
