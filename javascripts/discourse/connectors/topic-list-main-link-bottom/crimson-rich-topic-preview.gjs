import Component from "@glimmer/component";

export default class CrimsonRichTopicPreview extends Component {
  static shouldRender(outletArgs) {
    const topic = outletArgs.topic;

    return (
      topic?.archetype !== "private_message" &&
      Boolean(topic?.image_url || topic?.excerpt)
    );
  }

  get previewClass() {
    return this.args.outletArgs.topic.image_url
      ? "cn-topic-rich-preview"
      : "cn-topic-rich-preview cn-topic-rich-preview--text-only";
  }

  <template>
    <div class={{this.previewClass}}>
      {{#unless @outletArgs.expandPinned}}
        {{#if @outletArgs.topic.excerpt}}
          <p class="cn-topic-rich-preview__excerpt">
            {{@outletArgs.topic.excerpt}}
          </p>
        {{/if}}
      {{/unless}}

      {{#if @outletArgs.topic.image_url}}
        <div class="cn-topic-rich-preview__media" aria-hidden="true">
          <img
            src={{@outletArgs.topic.image_url}}
            alt=""
            width="160"
            height="90"
            loading="lazy"
            decoding="async"
          />
        </div>
      {{/if}}
    </div>
  </template>
}
