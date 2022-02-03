from datasets import load_metric

def get_cer(prediction, reference):
    cer = load_metric("cer")
    score=cer.compute(predictions=[prediction], references=[reference])
    return score

def get_wer(prediction, reference):
    wer = load_metric("wer")
    score=wer.compute(predictions=[prediction], references=[reference])
    return score
