import MenuItem from './MenuItem';

export default class Menu {
    constructor (main) {
        this.main = main;
        this.menus = {};

        // CREATE MENU Container
        this.el = document.createElement('ul');
        this.el.setAttribute('class', 'ge_menu_bar');

        // this.menus.autoupdate.button.style.color = main.autoupdate ? 'white' : 'gray';

        // TEST
        this.menus.test = new MenuItem(this.el, 'ge_menu', '<i class="material-icons">timeline</i> Test', (event) => {
            main.visualDebugger.check();
        });

        // EXPORT
        this.menus.share = new MenuItem(this.el, 'ge_menu', '<i class="material-icons">arrow_upward</i> Download', (event) => {
            main.download();
        });

        // AUTOUPDATE
        // this.menus.autoupdate = new MenuItem(this.el, 'ge_menu', ' <i class="material-icons">autorenew</i> Update: ON', (event) => {
        //     if (main.autoupdate) {
        //         main.autoupdate = false;
        //         this.menus.autoupdate.name = '<i class="material-icons">autorenew</i> Update: OFF';
        //         // this.menus.autoupdate.button.style.color = 'gray';
        //     }
        //     else {
        //         main.autoupdate = true;
        //         main.update();
        //         this.menus.autoupdate.name = '<i class="material-icons">autorenew</i> Update: ON';
        //         // this.menus.autoupdate.button.style.color = 'white';
        //     }
        // });

        main.container.appendChild(this.el);
    }
}
