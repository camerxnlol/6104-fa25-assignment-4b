import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { friendsApi } from '@/api'

const LoginView = () => import('../views/LoginView.vue')
const RegisterView = () => import('../views/RegisterView.vue')
const ProfileView = () => import('../views/ProfileView.vue')
const HomeView = () => import('../views/HomeView.vue')
const RankView = () => import('../views/RankView.vue')
const FriendsView = () => import('../views/FriendsView.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'root', component: HomeView },
    { path: '/home', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView },
    { path: '/profile', name: 'profile', component: ProfileView },
    { path: '/profile/:userId', name: 'profile-user', component: ProfileView },
    { path: '/rank', name: 'rank', component: RankView },
    { path: '/friends', name: 'friends', component: FriendsView },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  const isAuthed = auth.isAuthenticated
  if (to.name === 'login' && isAuthed) {
    return { name: 'home' }
  }
  if (to.name === 'register' && isAuthed) {
    return { name: 'home' }
  }
  if (to.name === 'root') {
    return { name: 'home' }
  }
  if (to.name === 'profile-user') {
    const selfId = auth.userId
    const targetId = String(to.params.userId || '')
    if (!targetId) return { name: 'profile' }
    if (selfId && targetId === selfId) return true
    if (!selfId) return { name: 'login' }
    try {
      const allowed = await friendsApi.verifyFriendship(selfId, targetId)
      if (allowed) return true
    } catch (_) {}
    return { name: 'profile' }
  }
})

export default router


