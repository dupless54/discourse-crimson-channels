import Component from "@glimmer/component";

export default class CrimsonRichTopicPreview extends Component {
  static shouldRender(outletArgs) {
    const topic = outletArgs.topic;

    return (
      topic?.archetype !== "private_message" &&
      Boolean(topic?.image_url || topic?.excerpt)
    );
  }

  <template>
    <div
      class="cn-topic-rich-preview {{unless @outletArgs.topic.image_url 'cn-topic-rich-preview--text-only'}}"
    >
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
            width="640"
            height="360"
            loading="lazy"
            decoding="async"
          />
        </div>
      {{/if}}
    </div>
  </template>
}
