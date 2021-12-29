yum.define([

], function () {

    PiDefine('ContactModel', class extends PiModel {

        init() {
            super.init('api/contact');
        }

        validators() {
            return {
                'nome': new PiValidatorRequire('Nome é um campo obrigatório'),
                'email': new PiValidatorEmail('Email é obrigatório'),
                'telefones': new PiValidatorCallback('Informe pelo menos um telefone', (telefones) => {
                    return telefones.length > 0;
                })
            };
        }

        initWithJson(json) {
            super.initWithJson(json);

            return this;
        }
    });
    
});