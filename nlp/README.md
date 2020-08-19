# [Attention Is All You Need](https://arxiv.org/abs/1706.03762)

## 簡介
在 2017 年，由 self attention 構成的新模型 Transformer 被提出。  
最初使用在文本翻譯的研究上，從而推廣至整個 NLP 領域。    
但實際上，只要能將問題轉換成「N個一維張量」，就能使用 Transformer 處理。

#### 優點：
* **快速**：跟 RNN 類的模型相比，可將輸入序列做平行運算。
* **長距離關注**：跟 CNN 類的模型相比，可依據輸入序列長度動態改變感受野。

#### 缺點：
* **記憶體使用量過大**，受硬體設備限制了其關注距離。

#### [更多...](https://toonnyy8.github.io/deep-learning-notes/attention-is-all-you-need/)
