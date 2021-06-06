<template>
  <div class="flex">
    <!-- Backdrop -->
    <div
      :class="isOpen ? 'block' : 'hidden'"
      class="fixed z-20 inset-0 bg-black opacity-50 transition-opacity lg:hidden"
      @click="isOpen = false"
    />
    <!-- End Backdrop -->

    <div
      :class="isOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'"
      class="fixed z-30 inset-y-0 left-0 w-64 transition duration-300 transform bg-white overflow-y-auto lg:translate-x-0 lg:static lg:inset-0"
    >
      <div class="flex items-center justify-center mt-8">
        <router-link
          class="flex items-center"
          to="/"
        >
          <go-plan-logo />
        </router-link>
      </div>

      <nav class="mt-14">
        <div class="ml-10 text-xs font-bold text-gray-400 tracking-wide mt-6">
          My Portfolio
        </div>

        <navigation-item
          title="Analytics"
          to="/analytics"
        >
          <ChartBarIcon
            class="h-5 w-5"
          />
        </navigation-item>

        <navigation-item
          title="Holdings"
          to="/holdings"
        >
          <GoIcons
            name="MenuAlt2"
            type="outline"
            class="h-5 w-5"
          />
        </navigation-item>


        <navigation-item
          title="Transactions"
          to="/transactions"
        >
          <GoIcons
            name="SwitchHorizontal"
            type="outline"
            class="h-5 w-5"
          />
        </navigation-item>


        <div class="ml-10 text-xs font-bold text-gray-400 tracking-wide mt-6">
          Research
        </div>
        <navigation-item
          title="Watchlists"
          to="/watchlists"
        >
          <GoIcons
            name="TrendingUp"
            type="outline"
            class="h-5 w-5"
          />
        </navigation-item>
      </nav>
    </div>
  </div>
</template>

<script lang="ts">
import GoPlanLogo from '/@components/base/GoPlanLogo.vue'
import { ChartBarIcon } from '@heroicons/vue/outline'
import { defineComponent } from 'vue'
import { useSidebar } from '../hooks/useSidebar'
import NavigationItem from './NavigationItem.vue'


export default defineComponent({
  components: {GoPlanLogo, NavigationItem, ChartBarIcon},
  setup () {
    const {isOpen} = useSidebar()

    return {
      isOpen,
    }
  },
})
</script>
