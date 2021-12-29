yum.define([
    PiUrl.create('pages/contact/list.html'),
    PiUrl.create('pages/contact/model.js')
], function (view) {

    PiDefine('ContactList', class extends PiComponent {
        contacts = [];
        contactsView = [];

        emptyList = true;
        order = 'desc';

        instances() {
            this.view = view;
        }

        viewDidLoad() {
            this.loadContacts();
        }

        loadContacts() {
            ContactModel.create().all().ok((contacts) => {
                this.contacts = contacts;
                this._orderArrayByNome(contacts, 'asc');
                this._updateContactView(contacts);
            });
        }

        search(nome) {
            const nomeFormatado = nome.toLowerCase();
            const contacts = this.contacts.filter(c => c.nome.toLowerCase().indexOf(nomeFormatado) > -1);

            this._updateContactView(contacts);
        }

        orderAsc() {
            this.order = 'desc';

            this._orderArrayByNome(this.contactsView, 'asc');
            this.contactsView.reload();
        }

        orderDesc() {
            this.order = 'asc';

            this._orderArrayByNome(this.contactsView, 'desc');
            this.contactsView.reload();
        }

        _updateContactView(contacts) {
            this.contactsView.clear().load(contacts);
            this.emptyList = this.contactsView.length == 0;
        }

        _orderArrayByNome(arr, order) {
            arr.sort((c1, c2) => {
                if (order == 'asc') {
                    return c1.nome > c2.nome ? 1 : -1;
                } else {
                    return c2.nome > c1.nome ? 1 : -1;
                }
            });
        }

    });

});