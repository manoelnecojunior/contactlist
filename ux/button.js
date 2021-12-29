yum.define([

], function () {

    PiDefine('Button', class extends PiComponent {
        loading = false;

        instances() {
            this.view = `
            <button :class="{{klass}}" @click="click($event)">
                <div :if="{{loading}}" class="ui active inline loader tiny inverted" style="position: relative; top: -1px"></div>
                <span>{{label}}</span>
            </button>`;
        }

        anime(b) {
            this.loading = b;
        }

        click(e) {
            e.stopPropagation();
            e.preventDefault();

            this.dispatchEvent('click');
        }
    
    });
    
});