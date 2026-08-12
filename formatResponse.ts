function mapStopReason(finishReason: string): string {
  if (finishReason === 'tool_calls') return 'tool_use';
  if (finishReason === 'length') return 'max_tokens';
  return 'end_turn';
}

export function formatOpenAIToAnthropic(completion: any, model: string): any {
  const messageId = "msg_" + Date.now();

  let content: any = [];
  if (completion.choices[0].message.content) {
    content = [{ text: completion.choices[0].message.content, type: "text" }];
  } else if (completion.choices[0].message.tool_calls) {
    content = completion.choices[0].message.tool_calls.map((item: any) => {
      return {
        type: 'tool_use',
        id: item.id,
        name: item.function?.name,
        input: item.function?.arguments ? JSON.parse(item.function.arguments) : {},
      };
    });
  }

  const result = {
    id: messageId,
    type: "message",
    role: "assistant",
    content: content,
    stop_reason: mapStopReason(completion.choices[0].finish_reason),
    stop_sequence: null,
    model,
    usage: {
      input_tokens: completion.usage?.prompt_tokens ?? 0,
      output_tokens: completion.usage?.completion_tokens ?? 0,
    },
  };
  return result;
}