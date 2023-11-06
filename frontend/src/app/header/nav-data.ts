export const navbarData = [
    {
        routerLink: 'map',
        icon: 'travel_explore',
        label: 'Mapa'
    },
    {
        routerLink: 'analysis',
        icon: 'query_stats',
        label: 'Pronósticos'
    },
    {
        routerLink: 'user',
        icon: 'account_circle',
        label: sessionStorage.getItem('idUserName'),
    },
];

export const navbarDataAdmin = [
    {
        routerLink: 'map',
        icon: 'travel_explore',
        label: 'Mapa'
    },
    {
        routerLink: 'analysis',
        icon: 'query_stats',
        label: 'Pronósticos'
    },
    {
        routerLink: 'user',
        icon: 'account_circle',
        label: sessionStorage.getItem('idUserName'),
    },
    {
        routerLink: 'admin',
        icon: 'admin_panel_settings',
        label: 'Administrador'
    },
];

export const fedePapa = [
    {
        routerLink: 'https://observatoriofnfp.com/',
        icon: 'psychiatry',
        label: 'Observatorio'
    },
];

export const logOut = [
    {
        routerLink: 'logout',
        icon: 'fa fa-solid fa-arrow-right-from-bracket',
        label: 'Cerrar Sesión',
    }
]