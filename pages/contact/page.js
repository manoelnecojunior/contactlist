yum.define([
    PiUrl.create('pages/contact/page.html'),
    PiUrl.create('pages/contact/model.js'),
    PiUrl.create('ux/phonelist.js'),
    PiUrl.create('ux/button.js')
], function (view) {

    PiDefine('ContactPage', class extends PiComponent {
        instances() {
            this.view = view;

            this.contact = new ContactModel();
        }

        init(contactId) {
            if (contactId) {
                this.loadContact(contactId);
            }
        }

        loadContact(contactId) {
            ContactModel.create().get(contactId).ok((contact) => {
                this.contact = contact;

                this.inject(contact);
                /**
                 * 
                 *    model ==>>> component
                 * ----------------------------
                 * 
                 * input[nome].set(model.nome)
                 * input[sobrenome].set(model.sobrenome)
                 * input[email].set(model.email)
                 * phonelist.set(model.telefones)
                 * 
                 */
            });
        }

        saveContact(button) {
            const errors = this.contact.inject(this);
            /**
             *    component ==>>> model
             * ----------------------------
             * 
             * model.nome = input[nome].value
             * model.sobrenome = input[sobrenome].value
             * model.email = input[email].value
             * model.telefones = phonelist.get()
             * 
             */

            button.anime(true);

            if (errors.length) {
                button.anime(false);
                return;
            }

            this.contact.save().ok(() => {
                button.anime(false);
            });
        }

    });

});