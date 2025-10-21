import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const LoginView = () => import('../views/LoginView.vue')
const RegisterView = () => import('../views/RegisterView.vue')
const ProfileView = () => import('../views/ProfileView.vue')
const HomeView = () => import('../views/HomeView.vue')
const RankView = () => import('../views/RankView.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'root', component: HomeView },
    { path: '/home', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/profile', name: 'profile', component: ProfileView },
    { path: '/rank', name: 'rank', component: RankView },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  const isAuthed = auth.isAuthenticated
  if ((to.name === 'root' || to.name === 'home') && !isAuthed) {
    return { name: 'login' }
  }
  if (to.name === 'login' && isAuthed) {
    return { name: 'home' }
  }
  if (to.name === 'register' && isAuthed) {
    return { name: 'home' }
  }
  if (to.name === 'root') {
    return { name: isAuthed ? 'home' : 'login' }
  }
})

export default router


