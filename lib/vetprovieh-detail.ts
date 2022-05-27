import {
  VetproviehElement,
  WebComponent,
} from '@vetprovieh/vetprovieh-shared';
import {VetproviehBasicDetail} from './vetprovieh-basic-detail';

// eslint-disable-next-line new-cap
@WebComponent({
  template: VetproviehElement.template + `
  <form id="form">
      <vetprovieh-notification id="notification">
      </vetprovieh-notification>
      <div id="detail" class="container">

      </div>
      <hr/>
      <div class="container sticky-footer">
      <div class="columns is-mobile">
          <div class="column">
              <input id="abortButton"
                      class="button is-light is-fullwidth"
                      type="reset" value="Zurück">
          </div>

          \${this.destroyButton}

          <div class="column">
              <input id="saveButton"
                      class="button is-success is-fullwidth"
                      type="button" value="Speichern">
          </div>
      </div>
      </div>
  </form>
  `,
  tag: 'vetprovieh-detail',
})
/**
 * `vetprovieh-detail`
 * Detail-Frame for Read, Create and Update Entities. Used in Vet:Provieh.
 *
 * @customElement
 */
export class VetproviehDetail extends VetproviehBasicDetail {
}
