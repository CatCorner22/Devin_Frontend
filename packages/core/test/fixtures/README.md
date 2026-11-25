# Legacy color fixtures

`project-v1-sticker-main.json` models a version-1 Sticker Pop file with only a main-hue edit (18). Version 1 left its second hue at 255. It uses the existing version-1 sample's content and record shape, with behavior fields omitted because version 1 did not write them.

`project-v2-sticker-main.json` is that file opened and saved by `parseProject` from commit `583f549`, before the Skin-change PR. The fixture was generated using that commit's bundled core, not the current parser. It has the same saved colors and no Skin layer.

The tests compare every saved color input before and after opening and a second round trip. The intentional contrast-floor repairs recorded in D71 still apply when tokens are derived; these fixtures do not ask for failing contrast pairs to return.
