import { eq, multiple, seq, treeNode } from "./macros.ts";
import { doc, linkfreechar, postprocess, titletext } from "./mediawiki.ts";

let ALT2 = new treeNode("root");
let res = doc(
  `== 组成 ==

由以下部分组成：

* 供电电路：

: 稳压

* 时钟
* 复位
* 单片机内部电路

* a
** baa
*** caaa
*** cbaa
** bba
*** ccaa
** bca
* b
* c


== 分类 ==

* [[Intel 8051>>工学.8051系列MCU.WebHome]]
* [[ARM stm32>>imported.Stm32]]

[[imported.分类:硬件开发]]`,
  ALT2,
);
postprocess(ALT2);
console.log(ALT2.toString());
console.log(res[1]);
let b = {
  "name": "root",
  "raw": "",
  "childs": [{
    "name": "title",
    "raw": "== 组成 ==",
    "childs": [{ "name": "titletext", "raw": " 组成 ", "childs": [] }],
  }, {
    "name": "par",
    "raw": "由以下部分组成：",
    "childs": [{
      "name": "text",
      "raw": "由以下部分组成：",
      "childs": [{ "name": "__plain", "raw": "由以下部分组成：", "childs": [] }],
    }],
  }, {
    "name": "par",
    "raw": "* 供电电路：",
    "childs": [{
      "name": "list",
      "raw": "",
      "childs": [{
        "name": "item",
        "raw": "* 供电电路：",
        "childs": [{
          "name": "text",
          "raw": " 供电电路：",
          "childs": [{ "name": "__plain", "raw": " 供电电路：", "childs": [] }],
        }],
      }],
    }],
  }, {
    "name": "par",
    "raw": ": 稳压",
    "childs": [{
      "name": "list",
      "raw": "",
      "childs": [{
        "name": "item",
        "raw": ": 稳压",
        "childs": [{
          "name": "text",
          "raw": " 稳压",
          "childs": [{ "name": "__plain", "raw": " 稳压", "childs": [] }],
        }],
      }],
    }],
  }, {
    "name": "par",
    "raw": "* 时钟\n* 复位\n* 单片机内部电路",
    "childs": [{
      "name": "list",
      "raw": "",
      "childs": [{
        "name": "item",
        "raw": "* 时钟",
        "childs": [{
          "name": "text",
          "raw": " 时钟",
          "childs": [{ "name": "__plain", "raw": " 时钟", "childs": [] }],
        }],
      }, {
        "name": "item",
        "raw": "* 复位",
        "childs": [{
          "name": "text",
          "raw": " 复位",
          "childs": [{ "name": "__plain", "raw": " 复位", "childs": [] }],
        }],
      }, {
        "name": "item",
        "raw": "* 单片机内部电路",
        "childs": [{
          "name": "text",
          "raw": " 单片机内部电路",
          "childs": [{ "name": "__plain", "raw": " 单片机内部电路", "childs": [] }],
        }],
      }],
    }],
  }, {
    "name": "par",
    "raw":
      "* a\n** baa\n*** caaa\n*** cbaa\n** bba\n*** ccaa\n** bca\n* b\n* c",
    "childs": [{
      "name": "list",
      "raw": "",
      "childs": [{
        "name": "item",
        "raw": "* a",
        "childs": [{
          "name": "text",
          "raw": " a",
          "childs": [{ "name": "__plain", "raw": " a", "childs": [] }],
        }],
      }, {
        "name": "item",
        "raw": "** baa",
        "childs": [{
          "name": "list",
          "raw": "",
          "childs": [{
            "name": "item",
            "raw": "** baa",
            "childs": [{
              "name": "text",
              "raw": " baa",
              "childs": [{ "name": "__plain", "raw": " baa", "childs": [] }],
            }],
          }, {
            "name": "item",
            "raw": "*** caaa",
            "childs": [{
              "name": "list",
              "raw": "",
              "childs": [{
                "name": "item",
                "raw": "*** caaa",
                "childs": [{
                  "name": "text",
                  "raw": " caaa",
                  "childs": [{
                    "name": "__plain",
                    "raw": " caaa",
                    "childs": [],
                  }],
                }],
              }, {
                "name": "item",
                "raw": "*** cbaa",
                "childs": [{
                  "name": "text",
                  "raw": " cbaa",
                  "childs": [{
                    "name": "__plain",
                    "raw": " cbaa",
                    "childs": [],
                  }],
                }],
              }],
            }],
          }, {
            "name": "item",
            "raw": "** bba",
            "childs": [{
              "name": "text",
              "raw": " bba",
              "childs": [{ "name": "__plain", "raw": " bba", "childs": [] }],
            }],
          }, {
            "name": "item",
            "raw": "*** ccaa",
            "childs": [{
              "name": "list",
              "raw": "",
              "childs": [{
                "name": "item",
                "raw": "*** ccaa",
                "childs": [{
                  "name": "text",
                  "raw": " ccaa",
                  "childs": [{
                    "name": "__plain",
                    "raw": " ccaa",
                    "childs": [],
                  }],
                }],
              }],
            }],
          }, {
            "name": "item",
            "raw": "** bca",
            "childs": [{
              "name": "text",
              "raw": " bca",
              "childs": [{ "name": "__plain", "raw": " bca", "childs": [] }],
            }],
          }],
        }],
      }, {
        "name": "item",
        "raw": "* b",
        "childs": [{
          "name": "text",
          "raw": " b",
          "childs": [{ "name": "__plain", "raw": " b", "childs": [] }],
        }],
      }, {
        "name": "item",
        "raw": "* c",
        "childs": [{
          "name": "text",
          "raw": " c",
          "childs": [{ "name": "__plain", "raw": " c", "childs": [] }],
        }],
      }],
    }],
  }, {
    "name": "title",
    "raw": "== 分类 ==",
    "childs": [{ "name": "titletext", "raw": " 分类 ", "childs": [] }],
  }, {
    "name": "par",
    "raw":
      "* [[Intel 8051>>工学.8051系列MCU.WebHome]]\n* [[ARM stm32>>imported.Stm32]]",
    "childs": [{
      "name": "list",
      "raw": "",
      "childs": [{
        "name": "item",
        "raw": "* [[Intel 8051>>工学.8051系列MCU.WebHome]]",
        "childs": [{
          "name": "text",
          "raw": " [[Intel 8051>>工学.8051系列MCU.WebHome]]",
          "childs": [{ "name": "__plain", "raw": " ", "childs": [] }, {
            "name": "hyperlink",
            "raw": "[[Intel 8051>>工学.8051系列MCU.WebHome]]",
            "childs": [
              { "name": "__label", "raw": "Intel 8051", "childs": [] },
              { "name": "__path", "raw": "工学.8051系列MCU.WebHome", "childs": [] },
            ],
          }],
        }],
      }, {
        "name": "item",
        "raw": "* [[ARM stm32>>imported.Stm32]]",
        "childs": [{
          "name": "text",
          "raw": " [[ARM stm32>>imported.Stm32]]",
          "childs": [{ "name": "__plain", "raw": " ", "childs": [] }, {
            "name": "hyperlink",
            "raw": "[[ARM stm32>>imported.Stm32]]",
            "childs": [
              { "name": "__label", "raw": "ARM stm32", "childs": [] },
              { "name": "__path", "raw": "imported.Stm32", "childs": [] },
            ],
          }],
        }],
      }],
    }],
  }, {
    "name": "par",
    "raw": "[[imported.分类:硬件开发]]",
    "childs": [{
      "name": "text",
      "raw": "[[imported.分类:硬件开发]]",
      "childs": [{
        "name": "hyperlink",
        "raw": "[[imported.分类:硬件开发]]",
        "childs": [{
          "name": "__label",
          "raw": "imported.分类:硬件开发",
          "childs": [],
        }],
      }],
    }],
  }],
};
let a = {
  "name": "root",
  "raw": "",
  "childs": [{
    "name": "title",
    "raw": "=== T1 ===",
    "childs": [{ "name": "titletext", "raw": " T1 ", "childs": [] }],
  }, {
    "name": "par",
    "raw": "A simple text",
    "childs": [{
      "name": "text",
      "raw": "A simple text",
      "childs": [{ "name": "__plain", "raw": "A simple text", "childs": [] }],
    }],
  }, {
    "name": "par",
    "raw":
      "A complicated text.A complicated text.A complicated text.A complicated text.A \ncomplicated text.A complicated text.A complicated text.A complicated text.A \ncomplicated text.",
    "childs": [{
      "name": "text",
      "raw":
        "A complicated text.A complicated text.A complicated text.A complicated text.A ",
      "childs": [{
        "name": "__plain",
        "raw":
          "A complicated text.A complicated text.A complicated text.A complicated text.A ",
        "childs": [],
      }],
    }, {
      "name": "text",
      "raw":
        "complicated text.A complicated text.A complicated text.A complicated text.A ",
      "childs": [{
        "name": "__plain",
        "raw":
          "complicated text.A complicated text.A complicated text.A complicated text.A ",
        "childs": [],
      }],
    }, {
      "name": "text",
      "raw": "complicated text.",
      "childs": [{
        "name": "__plain",
        "raw": "complicated text.",
        "childs": [],
      }],
    }],
  }, {
    "name": "par",
    "raw": "see also [[link>>target]]",
    "childs": [{
      "name": "text",
      "raw": "see also [[link>>target]]",
      "childs": [{ "name": "__plain", "raw": "see also ", "childs": [] }, {
        "name": "hyperlink",
        "raw": "[[link>>target]]",
        "childs": [{ "name": "__label", "raw": "link", "childs": [] }, {
          "name": "__path",
          "raw": "target",
          "childs": [],
        }],
      }],
    }],
  }, {
    "name": "par",
    "raw": "* List 1\n* List 1\n* List 1\n* List 1",
    "childs": [{
      "name": "__listitem",
      "raw": "* List 1",
      "childs": [{
        "name": "text",
        "raw": " List 1",
        "childs": [{ "name": "__plain", "raw": " List 1", "childs": [] }],
      }],
    }, {
      "name": "__listitem",
      "raw": "* List 1",
      "childs": [{
        "name": "text",
        "raw": " List 1",
        "childs": [{ "name": "__plain", "raw": " List 1", "childs": [] }],
      }],
    }, {
      "name": "__listitem",
      "raw": "* List 1",
      "childs": [{
        "name": "text",
        "raw": " List 1",
        "childs": [{ "name": "__plain", "raw": " List 1", "childs": [] }],
      }],
    }, {
      "name": "__listitem",
      "raw": "* List 1",
      "childs": [{
        "name": "text",
        "raw": " List 1",
        "childs": [{ "name": "__plain", "raw": " List 1", "childs": [] }],
      }],
    }],
  }, {
    "name": "par",
    "raw":
      "* List 1\n** List 1\n*** List 1\n** List 1 [[ref>>cite 1]]\n* List 1",
    "childs": [{
      "name": "__listitem",
      "raw": "* List 1",
      "childs": [{
        "name": "text",
        "raw": " List 1",
        "childs": [{ "name": "__plain", "raw": " List 1", "childs": [] }],
      }],
    }, {
      "name": "__listitem",
      "raw": "** List 1",
      "childs": [{
        "name": "text",
        "raw": " List 1",
        "childs": [{ "name": "__plain", "raw": " List 1", "childs": [] }],
      }],
    }, {
      "name": "__listitem",
      "raw": "*** List 1",
      "childs": [{
        "name": "text",
        "raw": " List 1",
        "childs": [{ "name": "__plain", "raw": " List 1", "childs": [] }],
      }],
    }, {
      "name": "__listitem",
      "raw": "** List 1 [[ref>>cite 1]]",
      "childs": [{
        "name": "text",
        "raw": " List 1 [[ref>>cite 1]]",
        "childs": [{ "name": "__plain", "raw": " List 1 ", "childs": [] }, {
          "name": "hyperlink",
          "raw": "[[ref>>cite 1]]",
          "childs": [{ "name": "__label", "raw": "ref", "childs": [] }, {
            "name": "__path",
            "raw": "cite 1",
            "childs": [],
          }],
        }],
      }],
    }, {
      "name": "__listitem",
      "raw": "* List 1",
      "childs": [{
        "name": "text",
        "raw": " List 1",
        "childs": [{ "name": "__plain", "raw": " List 1", "childs": [] }],
      }],
    }],
  }, {
    "name": "title",
    "raw": "=== T2 ===",
    "childs": [{ "name": "titletext", "raw": " T2 ", "childs": [] }],
  }],
};
