import Component from "@glimmer/component";

export default class CrimsonRichTopicPreview extends Component {
  static shouldRender(outletArgs) {
    const topic = outletArgs.topic;

    return topic?.archetype !== "private_message" && Boolean(topic?.excerpt);
  }

  <template>
    {{#unless @outletArgs.expandPinned}}
      <div class="cn-topic-rich-preview cn-topic-rich-preview--text-only">
        <p class="cn-topic-rich-preview__excerpt">
          {{@outletArgs.topic.excerpt}}
        </p>
      </div>
    {{/unless}}
  </template>
}
