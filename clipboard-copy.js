/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import {PolymerElement} from '../../@polymer/polymer/polymer-element.js';
import {html} from '../../@polymer/polymer/lib/utils/html-tag.js';
/**
 * An element that copies a text to clipboard.
 *
 * ### Example
 *
 * ```html
 * <clipboard-copy content="test"></clipboard-copy>
 * <script>
 * const elm = document.querySelectior('clipboard-copy');
 * if(elm.copy()) {
 *  console.info('Content has been copied to the clipboard');
 * } else {
 *  console.error('Content copy error. This browser is ancient!');
 * }
 * < /script>
 * ```
 *
 *
 * @customElement
 * @memberof LogicElements
 * @demo demo/index.html
 */
class ClipboardCopy extends PolymerElement {
  static get template() {
    return html`
    <style>
    :host {
      display: none;
    }

    :host([copying]) {
      display: inline;
      width: 0;
      height: 0;
      border: none;
      overflow: hidden;
    }
    </style>
    <div id="content">[[content]]</div>
`;
  }

  static get is() {
    return 'clipboard-copy';
  }
  static get properties() {
    return {
      /**
       * A content to be copied to the clipboard.
       * It must be set before calling the `copy` function.
       */
      content: String
    };
  }
  /**
   * Execute content copy.
   *
   * @return {Boolean} True if the content has been copied to the clipboard
   * and false if there was an error.
   */
  copy() {
    if (this._beforeCopy()) {
      return this._notifyCopied();
    }
    this.setAttribute('copying', true);
    const range = document.createRange();
    range.selectNode(this.$.content);
    window.getSelection().addRange(range);
    let result = false;
    try {
      result = document.execCommand('copy');
      this._notifyCopied();
    } catch (err) {
      // Copy command is not available
      console.error(err);
      const ev = new CustomEvent('content-copy-error', {
        bubbles: false
      });
      this.dispatchEvent(ev);
    }
    window.getSelection().removeAllRanges();
    this.removeAttribute('copying');
    return result;
  }
  /**
   * Sends the `content-copy` event.
   * If the event is canceled then the logic from this element won't be
   * executed. Useful if current platform doesn't support `execCommand('copy')`
   * and has other way to manage clipboard.
   *
   * @return {Boolean} True if handler executed copy function.
   */
  _beforeCopy() {
    const ev = new CustomEvent('content-copy', {
      detail: {
        value: this.content
      },
      bubbles: true,
      cancelable: true,
      composed: true
    });
    this.dispatchEvent(ev);
    return ev.defaultPrevented;
  }
  /**
   * Sends the `content-copied` event that is not bubbling.
   * @return {Boolean}
   */
  _notifyCopied() {
    const ev = new CustomEvent('content-copied', {
      bubbles: false
    });
    this.dispatchEvent(ev);
    return true;
  }
  /**
   * Fired when the content has been copied to the clipboard.
   *
   * Note: You can use return value of the `copy()` function. If the return
   * value is `true` then content has been copied to clipboard.
   *
   * @event content-copied
   */
  /**
   * Fired when there was an error copying content to clipboard.
   *
   * Note: You can use return value of the `copy()` function. If the return
   * value is `flase` then content has not been copied to clipboard.
   *
   * @event content-copy-error
   */
  /**
   * Fired when executing copy function.
   * This cancelable event is dispatched before running the actual logic
   * of this element to support platforms that doesn't allow to manage
   * clipboard with `execCommand('copy')`.
   *
   * When the event is canceled then the logic is not executed.
   *
   * @event content-copy
   * @param {String} value A content t be copied to clipboard.
   */
}
window.customElements.define(ClipboardCopy.is, ClipboardCopy);
