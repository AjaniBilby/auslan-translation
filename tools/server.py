# This is just a basic API test server to allow quick testing of produced models

import os
import torch
from transformers import BartForConditionalGeneration, BartTokenizer
from flask import Flask, request, jsonify


class SimpleBART(torch.nn.Module):
    def __init__(self, model_path):
        super(SimpleBART, self).__init__()

        if os.path.exists(model_path):
            self.bart = BartForConditionalGeneration.from_pretrained(model_path)
            self.tokenizer = BartTokenizer.from_pretrained('facebook/bart-base')
        else:
            raise ValueError(
                f"Model not found at {model_path}. Please make sure the path is correct or set load_from_saved to False.")

    def forward(self, input_ids, attention_mask):
        return self.bart(input_ids=input_ids, attention_mask=attention_mask)

    def decode_beam_to_tokens(self, beam_output):
        for token_id in beam_output[2:]:
            if token_id == self.tokenizer.eos_token_id:
                break

signedEnglish = SimpleBART('./saved_models/epoch_44')
auslan        = SimpleBART('./saved_models/epoch_60')

app = Flask(__name__)


def process(model, text):
    eos_token_id = model.tokenizer.eos_token_id

    # Tokenize the input text
    input_ids = model.tokenizer.encode(text, return_tensors="pt")

    # Beam search for top translations based on the input text
    translations = model.bart.generate(
        input_ids,
        num_beams=4,
        max_length=200,
        num_return_sequences=4,
        eos_token_id=model.tokenizer.eos_token_id
    )

    # Extract options and store them
    options = []
    for option in translations:
        token_list = option.tolist()

        try:
            eos_index = token_list.index(eos_token_id, 2)
        except ValueError:
            eos_index = len(token_list)

        options.append(token_list[2:eos_index])

    return options

@app.route("/translate/signed-english", methods=["POST"])
def translateSignedEnglish():
    # Extract source text from JSON request
    data = request.get_json(force=True)
    source_text = data.get("source_text", "")

    return jsonify({
        'vocab': "auslan_v1",
        'translations': process(signedEnglish, source_text)
    })

@app.route("/translate/auslan", methods=["POST"])
def translateAuslan():
    # Extract source text from JSON request
    data = request.get_json(force=True)
    source_text = data.get("source_text", "")

    return jsonify({
        'vocab': "auslan_v1",
        'translations': process(auslan, source_text)
    })

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
