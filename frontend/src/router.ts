import Buttons from '/@styleguide/views/Buttons.vue'
import Card from '/@styleguide/views/Card.vue'
import Charts from '/@styleguide/views/Charts.vue'

// import Login from "./views/Login.vue";
import Dashboard from '/@styleguide/views/Dashboard.vue'
import DataTables from '/@styleguide/views/DataTables.vue'
import Forms from '/@styleguide/views/Forms.vue'
import Inputs from '/@styleguide/views/Inputs.vue'
import Modals from '/@styleguide/views/Modals.vue'
import Styleguide from '/@styleguide/views/Styleguide.vue'
import StyleguideDetail from '/@styleguide/views/StyleguideDetail.vue'
import Tables from '/@styleguide/views/Tables.vue'
import UIElements from '/@styleguide/views/UIElements.vue'
import Analytics from '/@views/Analytics.vue'
import Details from '/@views/Details.vue'
import NotFound from '/@views/Error404.vue'
import Holdings from '/@views/Holdings.vue'
import Auth from '/@views/modules/Auth/Auth.vue'
import Profile from '/@views/modules/Auth/Profile.vue'
import Transactions from '/@views/Transactions.vue'
import Watchlists from '/@views/Watchlists.vue'
import WatchlistsDetails from '/@views/WatchlistsDetails.vue'
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'


const appRoutes : RouteRecordRaw[] = [
  {
    path      : '/auth',
    name      : 'auth',
    component : Auth,
    meta      : {
      requiresAuth : false,
      layout       : 'empty',
    },
  },
  {
    path      : '/',
    name      : 'home',
    component : Watchlists,
  },
  {
    path      : '/watchlists',
    name      : 'watchlists',
    component : Watchlists,
  },
  {
    path      : '/watchlists/:id',
    name      : 'watchlist',
    props     : true,
    component : WatchlistsDetails,
  },
  {
    path      : '/transactions',
    name      : 'transactions',
    props     : true,
    component : Transactions,
  },
  {
    path      : '/holdings',
    name      : 'holdings',
    props     : true,
    component : Holdings,
  },
  {
    path      : '/analytics',
    name      : 'analytics',
    props     : true,
    component : Analytics,
  },

  {
    path      : '/details/:ticker',
    name      : 'ticker_details',
    component : Details,
    props     : true,
  },
  {
    path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound,
  },
]

const styleguideRoutes : RouteRecordRaw[] = [
  {
    path      : '/styleguide',
    name      : 'styleguide',
    component : Styleguide,
  },
  {
    path      : '/styleguide/dashboard',
    name      : 'dashboard',
    component : Dashboard,
  },

  {
    path      : '/styleguide/modals',
    name      : 'Modals',
    component : Modals,
  },
  {
    path      : '/styleguide/charts',
    name      : 'Charts',
    component : Charts,
  },
  {
    path      : '/styleguide/forms',
    name      : 'Forms',
    component : Forms,
  },
  {
    path      : '/styleguide/inputs',
    name      : 'Inputs',
    component : Inputs,
  },
  {
    path      : '/styleguide/cards',
    name      : 'Cards',
    component : Card,
  },
  {
    path      : '/styleguide/tables',
    name      : 'Tables',
    component : Tables,
  },
  {
    path      : '/styleguide/ui-elements',
    name      : 'UIElements',
    component : UIElements,
  },
  {
    path      : '/styleguide/profile',
    name      : 'profile',
    component : Profile,
  },
  {
    path      : '/styleguide/buttons',
    name      : 'buttons',
    component : Buttons,
  },
  {
    path      : '/styleguide/data-tables',
    name      : 'data-tables',
    component : DataTables,
  },
  {
    path      : '/styleguide/details',
    name      : 'details',
    component : StyleguideDetail,
  },
]

styleguideRoutes.forEach(route => (route.meta = {layout: 'styleguide'}))

const routes = appRoutes.concat(styleguideRoutes)

const router = createRouter({
  history: createWebHistory(),
  routes,
})


export default router
