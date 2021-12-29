yum.define([
    PiUrl.create('pages/contact/list.js'),
    PiUrl.create('pages/contact/page.js'),
], function () {

    PiDefine('ContactService', class extends PiService {
        routes = {
            '/contact/new'() {
                app.setPage(new ContactPage());
            },

            '/contact/edit/:id'(id) {
                app.setPage(new ContactPage(id));
            },

            '/contact/list'() {
                app.setPage(new ContactList());
            }
        };
    });

});