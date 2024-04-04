import { createRouter, createWebHashHistory, LocationQueryRaw } from 'vue-router'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css'

import usePermission from '@/hooks/permission'
import { useUserStore } from '@/store'
import PageLayout from '@/layout/page-layout.vue'
import { isLogin } from '@/utils/auth'
import appRoutes from './modules'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const router = createRouter({
  history: createWebHashHistory(''),
  routes: [
    {
      path: '/',
      redirect: 'home',
    },
    // Login,
    // {
    //   path: '/config',
    //   name: 'config',
    //   component: () => import('@/views/login/config.vue'),
    //   meta: {
    //     title: '',
    //     requiresAuth: false,
    //   },
    // },
    {
      name: 'root',
      path: '/',
      component: PageLayout,
      children: [
        {
          path: '/home',
          name: 'home',
          component: () => import('@/views/home/videoList.vue'),
          meta: {
            locale: 'menu.account',
            requiresAuth: false,
            icon: 'icon-list',
          },
        },
        // {
        //   path: '/reply',
        //   name: 'reply',
        //   component: () => import('@/views/home/replySetting.vue'),
        //   meta: {
        //     locale: 'menu.reply',
        //     requiresAuth: false,
        //     icon: 'icon-list',
        //   },
        // },
        // {
        //   path: '/danmu',
        //   name: 'danmu',
        //   component: () => import('@/views/home/danmuList.vue'),
        //   meta: {
        //     locale: 'menu.danmu',
        //     requiresAuth: false,
        //     icon: 'icon-list',
        //   },
        // },
        // {
        //   path: '/video',
        //   name: 'video',
        //   component: () => import('@/views/home/videoList.vue'),
        //   meta: {
        //     locale: 'menu.video',
        //     requiresAuth: false,
        //     icon: 'icon-list',
        //   },
        // },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: () => import('@/views/not-found/index.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
