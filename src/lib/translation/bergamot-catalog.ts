/**
 * Mozilla bergamot (Firefox Translations) model catalog, mirrored on Hugging Face
 * (TiberiuCristianLeon/Bergamot, CC-BY-4.0) as .gz blobs byte-identical to the
 * Mozilla originals (sha256 oids verified against mozilla/firefox-translations-models LFS).
 *
 * Base-memory = current Firefox production models (~31.5MB; zh/ja ~43.8MB).
 * Tiny = smaller student models (~17MB).
 */
export interface BergamotFile {
  logical: string
  name: string
  size: number
  sha256: string
  url: string
}
export interface BergamotPair {
  /** Registry-style pair key, e.g. "enar". */
  pair: string
  /** Target language (2-letter). */
  lang: string
  tier: 'base-memory' | 'tiny'
  files: BergamotFile[]
}
export const BERGAMOT_PAIRS: BergamotPair[] = [
  {
    "pair": "enfr",
    "lang": "fr",
    "tier": "base-memory",
    "files": [
      {
        "logical": "lex.50.50.enfr.s2t.bin",
        "name": "lex.50.50.enfr.s2t.bin.gz",
        "size": 2297334,
        "sha256": "055987f0b585b61c4914fb4469e2392fda0b25d3f7784275974f920e7b631997",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enfr/lex.50.50.enfr.s2t.bin.gz"
      },
      {
        "logical": "model.enfr.intgemm.alphas.bin",
        "name": "model.enfr.intgemm.alphas.bin.gz",
        "size": 23045432,
        "sha256": "22cdaf3dc9a1da6e5818b5576737182467f3cd97e6fd6f94e4273eb7b56d1e3f",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enfr/model.enfr.intgemm.alphas.bin.gz"
      },
      {
        "logical": "vocab.enfr.spm",
        "name": "vocab.enfr.spm.gz",
        "size": 409706,
        "sha256": "5dcadaad8191fb4eb7677bce07098a20221dec95976a4db796f3a17cc82b4541",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enfr/vocab.enfr.spm.gz"
      }
    ]
  },
  {
    "pair": "enes",
    "lang": "es",
    "tier": "base-memory",
    "files": [
      {
        "logical": "lex.50.50.enes.s2t.bin",
        "name": "lex.50.50.enes.s2t.bin.gz",
        "size": 2265250,
        "sha256": "37a067966f28ff0ba430fddb7412bc5b07afa2cd2fd5a46d9ad74045a1a06380",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enes/lex.50.50.enes.s2t.bin.gz"
      },
      {
        "logical": "model.enes.intgemm.alphas.bin",
        "name": "model.enes.intgemm.alphas.bin.gz",
        "size": 22698792,
        "sha256": "fe4025fde24a4d5f80533cfb7acd53d0eb7f194dfc2d8f427f0d4563cfb6ac06",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enes/model.enes.intgemm.alphas.bin.gz"
      },
      {
        "logical": "vocab.enes.spm",
        "name": "vocab.enes.spm.gz",
        "size": 409312,
        "sha256": "ae2760c04bc6eb5362b16e5c2f145c376bb04bac421c33ba3c0766805e6f03b3",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enes/vocab.enes.spm.gz"
      }
    ]
  },
  {
    "pair": "ende",
    "lang": "de",
    "tier": "base-memory",
    "files": [
      {
        "logical": "lex.50.50.ende.s2t.bin",
        "name": "lex.50.50.ende.s2t.bin.gz",
        "size": 2314750,
        "sha256": "0370d79cda6fed5dfa8f9b2a0009459bd2766893825bb5b8b5114169d18da6c4",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/ende/lex.50.50.ende.s2t.bin.gz"
      },
      {
        "logical": "model.ende.intgemm.alphas.bin",
        "name": "model.ende.intgemm.alphas.bin.gz",
        "size": 22992073,
        "sha256": "e3a74458faba3ab2752ed8355c5e3979f13395279c8fc1bd3f54a3c2316e4975",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/ende/model.ende.intgemm.alphas.bin.gz"
      },
      {
        "logical": "vocab.ende.spm",
        "name": "vocab.ende.spm.gz",
        "size": 413879,
        "sha256": "3b2ddbfac73f994f151a8994447d6b3d41ab0d3435da56f79c233f34d03e45c2",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/ende/vocab.ende.spm.gz"
      }
    ]
  },
  {
    "pair": "enit",
    "lang": "it",
    "tier": "base-memory",
    "files": [
      {
        "logical": "lex.50.50.enit.s2t.bin",
        "name": "lex.50.50.enit.s2t.bin.gz",
        "size": 2209348,
        "sha256": "cd7ef06c0b872c15286a9796f105eb62693f14665490546ac70ce1c6c8f16d47",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enit/lex.50.50.enit.s2t.bin.gz"
      },
      {
        "logical": "model.enit.intgemm.alphas.bin",
        "name": "model.enit.intgemm.alphas.bin.gz",
        "size": 23892889,
        "sha256": "cfff470e9f29e27132723589a8bc985648f92773410e5f6fc43293d9e19f97f1",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enit/model.enit.intgemm.alphas.bin.gz"
      },
      {
        "logical": "vocab.enit.spm",
        "name": "vocab.enit.spm.gz",
        "size": 407598,
        "sha256": "8f99a6f493bf7e1a03fbba19928d7dc7bf9a1b7938238467f3e80a58c0d50485",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enit/vocab.enit.spm.gz"
      }
    ]
  },
  {
    "pair": "ennl",
    "lang": "nl",
    "tier": "base-memory",
    "files": [
      {
        "logical": "lex.50.50.ennl.s2t.bin",
        "name": "lex.50.50.ennl.s2t.bin.gz",
        "size": 2155034,
        "sha256": "b95c612e69270142c352589b4082b936810ec02ab7842c2a573bab6441709d06",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/ennl/lex.50.50.ennl.s2t.bin.gz"
      },
      {
        "logical": "model.ennl.intgemm.alphas.bin",
        "name": "model.ennl.intgemm.alphas.bin.gz",
        "size": 23386633,
        "sha256": "a1ab24477ca1289e123e9a2817434f99b47b9b5e461ec65ad273f3dd394814a2",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/ennl/model.ennl.intgemm.alphas.bin.gz"
      },
      {
        "logical": "vocab.ennl.spm",
        "name": "vocab.ennl.spm.gz",
        "size": 410222,
        "sha256": "0b12be4ccd0ee5182ad7e8ecd3254eece806ae183bece90fa625ceae7c851f80",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/ennl/vocab.ennl.spm.gz"
      }
    ]
  },
  {
    "pair": "enuk",
    "lang": "uk",
    "tier": "base-memory",
    "files": [
      {
        "logical": "lex.50.50.enuk.s2t.bin",
        "name": "lex.50.50.enuk.s2t.bin.gz",
        "size": 1564122,
        "sha256": "0c368488f43c5165c341b5112a02e42a1fabcc7bd0103d56262da025a9b3196f",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enuk/lex.50.50.enuk.s2t.bin.gz"
      },
      {
        "logical": "model.enuk.intgemm.alphas.bin",
        "name": "model.enuk.intgemm.alphas.bin.gz",
        "size": 22864374,
        "sha256": "a832a434ce97764c285dd9f7c193d0c283b80a61bf93fbafdcb8a6bd02273e12",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enuk/model.enuk.intgemm.alphas.bin.gz"
      },
      {
        "logical": "vocab.enuk.spm",
        "name": "vocab.enuk.spm.gz",
        "size": 436850,
        "sha256": "3e8e291d2c09f9ef98bace26e8092269807bbdad69f367d9a11b5c7c2cc009bb",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enuk/vocab.enuk.spm.gz"
      }
    ]
  },
  {
    "pair": "enfi",
    "lang": "fi",
    "tier": "base-memory",
    "files": [
      {
        "logical": "lex.50.50.enfi.s2t.bin",
        "name": "lex.50.50.enfi.s2t.bin.gz",
        "size": 1875557,
        "sha256": "c6b670273bdac5e96c78a2dd50c70a3b93bde60af6ead06ffb9f852c9e44c023",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enfi/lex.50.50.enfi.s2t.bin.gz"
      },
      {
        "logical": "model.enfi.intgemm.alphas.bin",
        "name": "model.enfi.intgemm.alphas.bin.gz",
        "size": 22580027,
        "sha256": "e75f0b5e86b03273ac1cca68184544913a0ff6483d6f9a01defd19bf973e49cf",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enfi/model.enfi.intgemm.alphas.bin.gz"
      },
      {
        "logical": "vocab.enfi.spm",
        "name": "vocab.enfi.spm.gz",
        "size": 414280,
        "sha256": "607524d7b6b8460d823c6b0e90a6593be682bc334a6f9c2c0f0d3767be66bdf9",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enfi/vocab.enfi.spm.gz"
      }
    ]
  },
  {
    "pair": "enru",
    "lang": "ru",
    "tier": "base-memory",
    "files": [
      {
        "logical": "lex.50.50.enru.s2t.bin",
        "name": "lex.50.50.enru.s2t.bin.gz",
        "size": 1378563,
        "sha256": "9c111984d8207f8dc6b9dd5c17ab4d18042f7c0e34105a09a35909538facc958",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enru/lex.50.50.enru.s2t.bin.gz"
      },
      {
        "logical": "model.enru.intgemm.alphas.bin",
        "name": "model.enru.intgemm.alphas.bin.gz",
        "size": 21988864,
        "sha256": "e766bc83434f4a9ff4110abe5450043a62cd402c6a7a8bca5e3e4d83b408dcb4",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enru/model.enru.intgemm.alphas.bin.gz"
      },
      {
        "logical": "vocab.enru.spm",
        "name": "vocab.enru.spm.gz",
        "size": 419005,
        "sha256": "9aa498dce5d27c02ac998c646c51a7475a421500ecdbbd1dff9ff3e77e64b21c",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enru/vocab.enru.spm.gz"
      }
    ]
  },
  {
    "pair": "enar",
    "lang": "ar",
    "tier": "base-memory",
    "files": [
      {
        "logical": "lex.50.50.enar.s2t.bin",
        "name": "lex.50.50.enar.s2t.bin.gz",
        "size": 1639219,
        "sha256": "b7466406d7f5e0c493bc65dc7de221aa3e6cd7f95c6fc7dd1e73759520c937ac",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enar/lex.50.50.enar.s2t.bin.gz"
      },
      {
        "logical": "model.enar.intgemm.alphas.bin",
        "name": "model.enar.intgemm.alphas.bin.gz",
        "size": 22857819,
        "sha256": "88e85e33403cda6b1a529f32dc30c0977a4234285d6f8340e0d630da21b176e5",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enar/model.enar.intgemm.alphas.bin.gz"
      },
      {
        "logical": "vocab.enar.spm",
        "name": "vocab.enar.spm.gz",
        "size": 418930,
        "sha256": "3a4b9e81c0f73ef8ed02c254b3ae99d64f8265afa54a6b838a0870bb4f9d0369",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enar/vocab.enar.spm.gz"
      }
    ]
  },
  {
    "pair": "enzh",
    "lang": "zh",
    "tier": "base-memory",
    "files": [
      {
        "logical": "lex.50.50.enzh.s2t.bin",
        "name": "lex.50.50.enzh.s2t.bin.gz",
        "size": 2536039,
        "sha256": "806f75821c0b838f4a8f4afe5bab3db8289cb7e5187753ba04c3bceadd75687a",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enzh/lex.50.50.enzh.s2t.bin.gz"
      },
      {
        "logical": "model.enzh.intgemm.alphas.bin",
        "name": "model.enzh.intgemm.alphas.bin.gz",
        "size": 33375922,
        "sha256": "7f255403b3bb2502f08ac4d5ca397a8a5a13f899d2f2e987a4934e089d241d16",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enzh/model.enzh.intgemm.alphas.bin.gz"
      },
      {
        "logical": "srcvocab.enzh.spm",
        "name": "srcvocab.enzh.spm.gz",
        "size": 407784,
        "sha256": "7846e3c236388390f4e5d321f8413d67f34c1bab5f066165eeb673bfd07607cc",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enzh/srcvocab.enzh.spm.gz"
      },
      {
        "logical": "trgvocab.enzh.spm",
        "name": "trgvocab.enzh.spm.gz",
        "size": 425748,
        "sha256": "4d641ce165b1f8478ee2ffb5149d2d46fab3779dc8fa1e9b97f9af1d2206c091",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enzh/trgvocab.enzh.spm.gz"
      }
    ]
  },
  {
    "pair": "enja",
    "lang": "ja",
    "tier": "base-memory",
    "files": [
      {
        "logical": "lex.50.50.enja.s2t.bin",
        "name": "lex.50.50.enja.s2t.bin.gz",
        "size": 2341409,
        "sha256": "7966382f7a9ba15993c67721526921d8901caa0f8add56eff04e4bb327d57c11",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enja/lex.50.50.enja.s2t.bin.gz"
      },
      {
        "logical": "model.enja.intgemm.alphas.bin",
        "name": "model.enja.intgemm.alphas.bin.gz",
        "size": 33052218,
        "sha256": "99fc8fc120189930beadacb2eef4b049d0794ac6132d1266340e457c95730368",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enja/model.enja.intgemm.alphas.bin.gz"
      },
      {
        "logical": "srcvocab.enja.spm",
        "name": "srcvocab.enja.spm.gz",
        "size": 404352,
        "sha256": "12d8ffc83fc0bb61494d95701f6a298bbad5c999a043d4a48a1c1bd61e092167",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enja/srcvocab.enja.spm.gz"
      },
      {
        "logical": "trgvocab.enja.spm",
        "name": "trgvocab.enja.spm.gz",
        "size": 431278,
        "sha256": "be7fec234b5fc94616276ee6cca69f3a8cbfa6762fdf278dfc6b11eaf669cc48",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enja/trgvocab.enja.spm.gz"
      }
    ]
  },
  {
    "pair": "envi",
    "lang": "vi",
    "tier": "base-memory",
    "files": [
      {
        "logical": "lex.50.50.envi.s2t.bin",
        "name": "lex.50.50.envi.s2t.bin.gz",
        "size": 2246027,
        "sha256": "12e8809c89d33dd1052c1619733d84fb7be9f49e5e72102e71fcf9f13c47737a",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/envi/lex.50.50.envi.s2t.bin.gz"
      },
      {
        "logical": "model.envi.intgemm.alphas.bin",
        "name": "model.envi.intgemm.alphas.bin.gz",
        "size": 24244705,
        "sha256": "0c0c339e218ca55ee577e4f0f800ba5bd0ad57f76ac940978e95663cf36bbe4a",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/envi/model.envi.intgemm.alphas.bin.gz"
      },
      {
        "logical": "vocab.envi.spm",
        "name": "vocab.envi.spm.gz",
        "size": 400183,
        "sha256": "497f3de63d59fd9f89bafc5e215e5cc8a308981f49a94de813c8fd0490885e25",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/envi/vocab.envi.spm.gz"
      }
    ]
  },
  {
    "pair": "encs",
    "lang": "cs",
    "tier": "base-memory",
    "files": [
      {
        "logical": "lex.50.50.encs.s2t.bin",
        "name": "lex.50.50.encs.s2t.bin.gz",
        "size": 1896925,
        "sha256": "e5e54ed7488b5beafef1947788534b6e3919ebe658d0a432ef00962bac1769ff",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/encs/lex.50.50.encs.s2t.bin.gz"
      },
      {
        "logical": "model.encs.intgemm.alphas.bin",
        "name": "model.encs.intgemm.alphas.bin.gz",
        "size": 23192301,
        "sha256": "363519c1560786f8c9c85737431ec61c770623b1ee99dff7b154019ab202d8d9",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/encs/model.encs.intgemm.alphas.bin.gz"
      },
      {
        "logical": "vocab.encs.spm",
        "name": "vocab.encs.spm.gz",
        "size": 412691,
        "sha256": "842c1396415257eb864d1ce4722eece82f024a23ecdc4e1be5defcdf6b6d2c0e",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/encs/vocab.encs.spm.gz"
      }
    ]
  },
  {
    "pair": "enhu",
    "lang": "hu",
    "tier": "base-memory",
    "files": [
      {
        "logical": "lex.50.50.enhu.s2t.bin",
        "name": "lex.50.50.enhu.s2t.bin.gz",
        "size": 1768398,
        "sha256": "b17f0abf8447b525267c2bcc9797756b5f78a2feba5448981bff4053c459fcc8",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enhu/lex.50.50.enhu.s2t.bin.gz"
      },
      {
        "logical": "model.enhu.intgemm.alphas.bin",
        "name": "model.enhu.intgemm.alphas.bin.gz",
        "size": 23710206,
        "sha256": "fc70a94672e4e68ed34c38ded5c7381ce09ebeeaeb6e7d6f59af2d4321a1babf",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enhu/model.enhu.intgemm.alphas.bin.gz"
      },
      {
        "logical": "vocab.enhu.spm",
        "name": "vocab.enhu.spm.gz",
        "size": 405720,
        "sha256": "0d7cb45eec941001086e816d9650f651b4f294b412e50f5e5d64003efda334f0",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/base-memory/enhu/vocab.enhu.spm.gz"
      }
    ]
  },
  {
    "pair": "ensv",
    "lang": "sv",
    "tier": "tiny",
    "files": [
      {
        "logical": "lex.50.50.ensv.s2t.bin",
        "name": "lex.50.50.ensv.s2t.bin.gz",
        "size": 1921270,
        "sha256": "0480c83e15f1d2dcee68873eee5fb66c2912884ab2757ff201e6b6ab9be38ed7",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/tiny/ensv/lex.50.50.ensv.s2t.bin.gz"
      },
      {
        "logical": "model.ensv.intgemm.alphas.bin",
        "name": "model.ensv.intgemm.alphas.bin.gz",
        "size": 12775086,
        "sha256": "f2fee438e0770428c06a4fa1e938175bf7c37f3a288313c317853b646437eb81",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/tiny/ensv/model.ensv.intgemm.alphas.bin.gz"
      },
      {
        "logical": "vocab.ensv.spm",
        "name": "vocab.ensv.spm.gz",
        "size": 398384,
        "sha256": "534e7f952f6bb97903301332836bab5d76cbc965592a9f1af77ace05e84e2edf",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/tiny/ensv/vocab.ensv.spm.gz"
      }
    ]
  },
  {
    "pair": "enda",
    "lang": "da",
    "tier": "tiny",
    "files": [
      {
        "logical": "lex.50.50.enda.s2t.bin",
        "name": "lex.50.50.enda.s2t.bin.gz",
        "size": 1582768,
        "sha256": "c3d79a2ba450f92ec7cb4f38a39d7b3e157417f6fb60d060fa6f3f2c05d31de9",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/tiny/enda/lex.50.50.enda.s2t.bin.gz"
      },
      {
        "logical": "model.enda.intgemm.alphas.bin",
        "name": "model.enda.intgemm.alphas.bin.gz",
        "size": 12723889,
        "sha256": "5afaea5545cfc759ad1d2c320d17606e95efcfb0c6e4d9019903ee4c00b8091f",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/tiny/enda/model.enda.intgemm.alphas.bin.gz"
      },
      {
        "logical": "vocab.enda.spm",
        "name": "vocab.enda.spm.gz",
        "size": 398818,
        "sha256": "2d9ff33c0adfc4a137ba0cc51f64e7886ae92dbd53fd718cce30fb6ec9aa33c2",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/tiny/enda/vocab.enda.spm.gz"
      }
    ]
  },
  {
    "pair": "enid",
    "lang": "id",
    "tier": "tiny",
    "files": [
      {
        "logical": "lex.50.50.enid.s2t.bin",
        "name": "lex.50.50.enid.s2t.bin.gz",
        "size": 1734565,
        "sha256": "41853979c81022487542eceed4994078bd144c63fff84a421616f3cc8f3162c1",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/tiny/enid/lex.50.50.enid.s2t.bin.gz"
      },
      {
        "logical": "model.enid.intgemm.alphas.bin",
        "name": "model.enid.intgemm.alphas.bin.gz",
        "size": 12503257,
        "sha256": "08bf854041ee20e955c013f17d86ae562b29388304151071e176b579e78fb0be",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/tiny/enid/model.enid.intgemm.alphas.bin.gz"
      },
      {
        "logical": "vocab.enid.spm",
        "name": "vocab.enid.spm.gz",
        "size": 379806,
        "sha256": "49af04de6f0e3c21afcb274e7a6931c8f9efae38932e2671b692bf1b6f6d279b",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/tiny/enid/vocab.enid.spm.gz"
      }
    ]
  },
  {
    "pair": "enhi",
    "lang": "hi",
    "tier": "tiny",
    "files": [
      {
        "logical": "lex.50.50.enhi.s2t.bin",
        "name": "lex.50.50.enhi.s2t.bin.gz",
        "size": 1690062,
        "sha256": "ce5f1dd9d4fb343cb6e0da91e4603e50b673b91ea22b50b959a0dc199d4e9dd9",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/tiny/enhi/lex.50.50.enhi.s2t.bin.gz"
      },
      {
        "logical": "model.enhi.intgemm.alphas.bin",
        "name": "model.enhi.intgemm.alphas.bin.gz",
        "size": 12736263,
        "sha256": "751032330fe04b9dd4e1245c4dcf8f58dd6836daa7ed3f3b93be52eb1fca9ba4",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/tiny/enhi/model.enhi.intgemm.alphas.bin.gz"
      },
      {
        "logical": "vocab.enhi.spm",
        "name": "vocab.enhi.spm.gz",
        "size": 430026,
        "sha256": "bb3bf8252b14fa57100beb371824cf51a7281e833a3becec135721fe679ce076",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/tiny/enhi/vocab.enhi.spm.gz"
      }
    ]
  },
  {
    "pair": "enro",
    "lang": "ro",
    "tier": "tiny",
    "files": [
      {
        "logical": "lex.50.50.enro.s2t.bin",
        "name": "lex.50.50.enro.s2t.bin.gz",
        "size": 1846074,
        "sha256": "a64099f219a6e4eee89085283ace66e8f0171d43b168ba155dffc2fa4dcdc9b1",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/tiny/enro/lex.50.50.enro.s2t.bin.gz"
      },
      {
        "logical": "model.enro.intgemm.alphas.bin",
        "name": "model.enro.intgemm.alphas.bin.gz",
        "size": 12207487,
        "sha256": "3596ee3bc1461c96f28edf200f4235fdfd4e0cb8434fa86ad04762d4a10d7a66",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/tiny/enro/model.enro.intgemm.alphas.bin.gz"
      },
      {
        "logical": "vocab.enro.spm",
        "name": "vocab.enro.spm.gz",
        "size": 397137,
        "sha256": "61a75f040f035844ec5d54edf5f80831cd8ad58bfa539a7e707a7f6a5bd25c63",
        "url": "https://huggingface.co/TiberiuCristianLeon/Bergamot/resolve/main/tiny/enro/vocab.enro.spm.gz"
      }
    ]
  }
]
