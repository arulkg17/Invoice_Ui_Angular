import { Routes } from "@angular/router";

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },

  // Masters
  {
    path: 'masters',
    children: [
      { path: 'categories', loadComponent: () => import('./components/item-list/item-list.component').then(m => m.ItemListComponent) },
      { path: 'items', loadComponent: () => import('./components/item-list/item-list.component').then(m => m.ItemListComponent) },
      { path: 'items/create', loadComponent: () => import('./components/item-form/item-form.component').then(m => m.ItemFormComponent) },
      { path: 'items/edit/:id', loadComponent: () => import('./components/item-form/item-form.component').then(m => m.ItemFormComponent) },
      { path: 'customers', loadComponent: () => import('./components/item-list/item-list.component').then(m => m.ItemListComponent) },
      { path: 'vendors', loadComponent: () => import('./components/item-list/item-list.component').then(m => m.ItemListComponent) }
    ]
  },

  // Transactions
  {
    path: 'transactions',
    children: [
      { path: 'indent', loadComponent: () => import('./components/item-list/item-list.component').then(m => m.ItemListComponent) },
      { path: 'po', loadComponent: () => import('./components/item-list/item-list.component').then(m => m.ItemListComponent) },
      { path: 'inward', loadComponent: () => import('./components/item-list/item-list.component').then(m => m.ItemListComponent) },
      { path: 'receipt', loadComponent: () => import('./components/item-list/item-list.component').then(m => m.ItemListComponent) }
    ]
  },

  { path: '**', redirectTo: 'home' }
];
