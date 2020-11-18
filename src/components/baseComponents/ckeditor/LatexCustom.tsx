// @ts-nocheck
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import AttributeCommand from '@ckeditor/ckeditor5-basic-styles/src/attributecommand';
import "./LatexCustom.scss";

const latexIcon = `
<svg version="1.1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
 <g transform="matrix(.70469 0 0 .70469 .41522 .77118)" stroke-width=".029776">
  <path transform="matrix(1.0908 0 0 1.0908 -1.4925 -1.4467)" d="m1.6191 7.8574-0.30469 3.9844h0.32422c0.23285-2.9833 0.48827-3.5059 3.2812-3.5059h0.99414c0.34391 0.053896 0.34375 0.27302 0.34375 0.6875v9.8027c0 0.6509-0.053203 0.84961-1.5703 0.84961h-0.51172v0.43555c0.8641-0.01668 1.7649-0.0332 2.6484-0.0332 0.88077 0 1.783 0.01653 2.6465 0.0332v-0.43555h-0.50195c-1.4945 0-1.5488-0.1987-1.5488-0.84961v-9.8027c0-0.39781-4.13e-5 -0.61395 0.32422-0.6875h0.98828c2.7558 0 3.0252 0.51965 3.2578 3.5059h0.32422l-0.29492-3.9844z"/>
  <path d="m21.475 19.806h-0.35305c-0.43068 2.9131-0.68467 4.4965-4.1401 4.4965h-2.7267c-0.7847 0-0.82173-0.09907-0.82173-0.77495v-5.4913h1.8533c1.8533 0 2.03 0.67915 2.03 2.3372h0.3157v-5.1106h-0.3157c0 1.6302-0.17701 2.2967-2.03 2.2967h-1.8536v-4.8686c0-0.66322 0.03735-0.76229 0.82173-0.76229h2.6861c3.04 0 3.3938 1.2083 3.6692 3.8056h0.35403l-0.47128-4.3451h-9.9471v0.53948c1.3914 0 1.6143 0 1.6143 0.88312v10.602c0 0.88312-0.21988 0.88312-1.6143 0.88312v0.47453h10.223"/>
  <path d="m26.771 13.056 2.9066-4.2022c0.29101-0.41249 0.88312-1.2615 2.4951-1.283v-0.4742c-0.44984 0.037346-1.1962 0.037346-1.6675 0.037346-0.64732 0-1.4535 0-1.9429-0.037346v0.47453c0.62912 0.058789 0.78372 0.45211 0.78372 0.76879 0 0.23483-0.09613 0.39333-0.23548 0.58853l-2.5935 3.7618-2.9066-4.2545c-0.13642-0.21404-0.15558-0.27608-0.15558-0.33486 0-0.17701 0.21404-0.51155 0.8646-0.53006v-0.4742c-0.62912 0.037346-1.5898 0.037346-2.2372 0.037346-0.50862 0-1.4905 0-1.965-0.037346v0.47453c1.079 0 1.432 0.040598 1.8659 0.65056l3.7897 5.566-3.4174 4.9924c-0.84316 1.2209-2.1196 1.2423-2.4951 1.2423v0.47453c0.44886-0.03736 1.1962-0.03736 1.6675-0.03736 0.53006 0 1.4535 0 1.9429 0.03736v-0.47453c-0.60769-0.05879-0.78372-0.45211-0.78372-0.76879 0-0.25399 0.09613-0.39333 0.1952-0.53298l3.1424-4.5861 3.4175 5.0233c0.1546 0.21729 0.1546 0.27608 0.1546 0.33486 0 0.1546-0.17604 0.49271-0.86395 0.53298v0.47453c0.62912-0.03735 1.5898-0.03735 2.2372-0.03735 0.50862 0 1.4905 0 1.9672 0.03735v-0.47453c-1.2582 0-1.4564-0.09613-1.8468-0.65056"/>
 </g>
</svg>
`

export default class LatexCustom extends Plugin {
    static get requires() {
        return [Widget];
    }

    editor: any = null;

    constructor(editor: any) {
        super(editor);
        this.editor = editor;
    }

    init() {
        this.defineSchema();
        this.defineConverters();
        this.defineToolbar();

        this.editor.editing.mapper.on(
            'viewToModelPosition',
            viewToModelPositionOutsideModelElement( this.editor.model, (viewElement: any) => viewElement.hasClass( 'placeholder' ) )
        );
    }

    defineSchema() {
        const schema = this.editor.model.schema;

        // schema.register('latex', {
        //     allowWhere: "$text",
        //     isInline: true,
        //     isObject: true,
        //     allowAttributes: ["code"]
        // });

        schema.extend("$text", {
            allowAttributes: ["latex"]
        })
    }

    defineConverters() {
        const conversion = this.editor.conversion;

        // Cast view to model.
        conversion.for('upcast').elementToAttribute({
            view: {
                name: 'span',
                attributes: {
                    class: 'latex',
                },
            },
            model: {
                key: 'latex',
                value: true
            },
        });

        // Cast model to view (data)
        conversion.for('dataDowncast').attributeToElement({
            model: 'latex',
            view: {
                name: 'span',
                classes: 'latex'
            },
        });

        // Cast model to view (editing)
        conversion.for('editingDowncast').attributeToElement({
            model: 'latex',
            view: {
                name: 'span',
                classes: 'latex-edit'
            },
        });
    }

    defineToolbar() {
        this.editor.commands.add('addLatex', new AttributeCommand(this.editor, 'latex'));

        this.editor.ui.componentFactory.add('latex', (locale: any) => {
            const command = this.editor.commands.get('addLatex');
            const view = new ButtonView(locale);

            view.set({
                label: "TeX",
                icon: latexIcon,
                tooltip: true,
                isToggleable: true,
            });

            view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );
            
            this.listenTo(view, 'execute', () => {
                console.log("button pressed");
                this.editor.execute('addLatex');
            });

            return view;
        });
    }
}