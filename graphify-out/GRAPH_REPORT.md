# Graph Report - .  (2026-07-29)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 7468 nodes · 20831 edges · 161 communities (129 shown, 32 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 2266 edges (avg confidence: 0.54)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5eed1a80`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- obsidian-excalidraw-plugin/main.js
- dataview/main.js
- obsidian-kanban/main.js
- obsidian-tasks-plugin/main.js
- e
- DateTime
- ExcalidrawView
- Locale
- .push
- ExcalidrawAutomate
- Document
- fromObject
- n
- Duration
- t$d
- .registerCommands
- e
- l
- ExcalidrawPlugin
- .slice
- .then
- handleImageRequest
- constructor
- templater-obsidian/main.js
- DataviewApi
- ExcalidrawData
- .onload
- isValid
- get
- .push
- get
- calendar/main.js
- .forEach
- ScriptEngine
- a
- getBoundingClientRect
- f
- t
- ToolsPanel
- constructor
- format
- errorlog
- Kn
- contains
- add
- rgb2css
- get
- createFilterOrErrorMessage
- fe
- y$1
- screen.tsx
- setDynamicStyle
- e
- Link
- resolve
- argument
- dependencies
- auth.ts
- .render
- explainQuery
- .linkClick
- InlineLinkSuggester
- t
- display
- apiClient.ts
- FloatingModal
- toString
- LocalStorageCache
- ExcalidrawSidepanelTab
- deserialize
- parseLine
- DataviewInlineApi
- .onClose
- L$1
- ExcalidrawSidepanelView
- Lexer
- expo
- collapsible.tsx
- CalendarView
- format
- GenericInputPrompt
- z
- identicalTo
- getDateFromFile
- sanitizeSvgTree
- Fe
- init$1
- dW
- AuthContext.tsx
- update
- parseCFFTable
- .handleError
- devDependencies
- path
- init
- userIgnoreFilters
- create_default_slot$1
- create_if_block$1
- diagramToHTML
- InsertLinkDialog
- .toString
- templater-obsidian/manifest.json
- scripts
- jest
- parseDocument
- GenericSuggester
- pn
- xi
- instance$7
- CalendarSettingsTab
- SvelteComponent
- u$1
- setupDragAndDrop
- include
- SvelteComponent
- blockString
- obsidian-excalidraw-plugin/manifest.json
- obsidian-tasks-plugin/manifest.json
- extractInlineFields
- FixedOffsetZone
- Zone
- dataview/manifest.json
- addName
- .addArrow
- Suggester
- obsidian-kanban/manifest.json
- calendar/manifest.json
- .toMessage
- ExcalidrawConfig
- CommandManager
- CarrinhoContext.tsx
- encryptStoredAPIKey
- reset-project.js
- d$1
- plugins
- DataviewInlineIOApi
- InlineWidget
- EditorHandler
- FrontmatterEditor
- ActionButton
- eslint.config.js
- metro.config.js
- ExcalidrawScene
- PromisePool
- Random
- fontFamily.ts
- @expo/metro-runtime
- expo-navigation-bar
- expo-splash-screen
- expo-symbols
- expo-system-ui
- react-native
- react-native-gesture-handler
- react-native-reanimated

## God Nodes (most connected - your core abstractions)
1. `ExcalidrawAutomate` - 374 edges
2. `ExcalidrawView` - 184 edges
3. `e()` - 132 edges
4. `n()` - 121 edges
5. `r()` - 120 edges
6. `DateTime` - 119 edges
7. `a()` - 117 edges
8. `i()` - 116 edges
9. `t$d()` - 108 edges
10. `t()` - 103 edges

## Surprising Connections (you probably didn't know these)
- `userIgnoreFilters` --extends--> `/node_modules/`  [EXTRACTED]
  .obsidian/app.json → package.json
- `extractInlineFields()` --indirect_call--> `wrapper()`  [INFERRED]
  .obsidian/plugins/dataview/main.js → __tests__/context/AuthContext.test.tsx
- `TerminalScreen()` --calls--> `getDeviceSerial()`  [EXTRACTED]
  app/terminal.tsx → services/deviceSerial.ts
- `bindAll()` --references--> `functions`  [EXTRACTED]
  .obsidian/plugins/dataview/main.js → package.json
- `stringifyFlowCollection()` --references--> `path`  [EXTRACTED]
  .obsidian/plugins/obsidian-excalidraw-plugin/main.js → scripts/reset-project.js

## Import Cycles
- None detected.

## Communities (161 total, 32 thin omitted)

### Community 0 - "obsidian-excalidraw-plugin/main.js"
Cohesion: 0.01
Nodes (294): a$7(), allwaysPassedUseAttrs, anyModifierKeysPressed(), applyArabicRequireLigatures(), applyLatinLigatures(), attrHandlers, binary, boolTag (+286 more)

### Community 1 - "dataview/main.js"
Cohesion: 0.01
Nodes (262): RFC-1123, RFC-2616, RFC-2822, accurateMatrix, add_css(), add_css$1(), add_css$2(), add_css$3() (+254 more)

### Community 2 - "obsidian-kanban/main.js"
Cohesion: 0.01
Nodes (179): $1(), aB(), abutsStart(), aD(), aI(), aw(), BD(), bimap() (+171 more)

### Community 3 - "obsidian-tasks-plugin/main.js"
Cohesion: 0.01
Nodes (134): jO(), jy(), addPreset(), addTimezone(), ag(), allPropertyNames(), allPropertyNamesSorted(), areTagsShown() (+126 more)

### Community 4 - "e"
Cohesion: 0.03
Nodes (142): a(), a$9(), addYouTubeThumbnail(), applyArabicPresentationForms(), applyStyles(), areValidElements(), around(), around1() (+134 more)

### Community 5 - "DateTime"
Cohesion: 0.02
Nodes (59): bestBy(), computeOrdinal(), DateTime, dateTimeFromMatches(), dayOfWeek(), daysInYear(), extractASCII(), extractIANAZone() (+51 more)

### Community 6 - "ExcalidrawView"
Cohesion: 0.03
Nodes (20): calculateUIModeValue(), deleteAppStateKeys(), ExcalidrawView, exportImageToFile(), getExportInternalLinks(), getExportPadding(), getExportTheme(), getMarginValue() (+12 more)

### Community 7 - "Locale"
Cohesion: 0.03
Nodes (41): buildRegex(), digitRegex(), eraForDateTime(), escapeToken(), expandMacroTokens(), explainFromTokens(), formatOptsToTokens(), Formatter (+33 more)

### Community 8 - ".push"
Cohesion: 0.02
Nodes (148): ABS(), absolutize(), ADD(), addSegment(), addTerminatorSegment(), AND(), arcToCubicCurves(), arrayPushArray() (+140 more)

### Community 9 - "ExcalidrawAutomate"
Cohesion: 0.02
Nodes (54): addFilterToForeignObjects(), ALIGNRP(), cloneElement(), createSVG(), cropCanvas(), editorInsertText(), ensureActiveScriptSettingsObject(), errorMessage() (+46 more)

### Community 10 - "Document"
Cohesion: 0.03
Nodes (64): addCommentBefore(), addMergeToJSMap(), addPairToJSMap(), ALIAS, anchorIsValid(), anchorNames(), applyReviver(), asItemIndex() (+56 more)

### Community 11 - "fromObject"
Cohesion: 0.03
Nodes (134): _0(), after(), Am(), aP(), aS(), b0(), ba(), bc() (+126 more)

### Community 12 - "n"
Cohesion: 0.07
Nodes (117): aa(), aN(), aO(), be(), bO(), Br(), bw(), _c() (+109 more)

### Community 13 - "Duration"
Cohesion: 0.03
Nodes (25): adjustTime(), asNumber(), BinaryOpHandler, clone$1(), createBinaryOps(), dayDiff(), diff(), diffRelative() (+17 more)

### Community 14 - "t$d"
Cohesion: 0.04
Nodes (23): AIModelConfigModal, AIProviderProfileModal, checkExcalidrawVersion(), checkScriptUpdates(), displayFontMessage(), EmbeddalbeMDFileCustomDataSettingsComponent, ExportDialog, fragWithHTML() (+15 more)

### Community 15 - ".registerCommands"
Cohesion: 0.07
Nodes (35): addBackOfTheNoteCard(), addTextWithOEmbed(), ANIMATED_IMAGE_TYPES, captureScreenshot(), carveOutImage(), carveOutPDF(), cloneElement$1(), createFileAndAwaitMetacacheUpdate() (+27 more)

### Community 16 - "e"
Cohesion: 0.05
Nodes (68): a(), A$1(), add_render_callback(), b(), blank_object(), c(), check_outros(), combineExtractors() (+60 more)

### Community 17 - "l"
Cohesion: 0.05
Nodes (97): T(), AD(), addClassName(), addDataAttribute(), addInternalClasses(), addTooltip(), Ae(), apply() (+89 more)

### Community 18 - "ExcalidrawPlugin"
Cohesion: 0.03
Nodes (19): copyLinkToSelectedElementToClipboard(), dedupe(), emulateCTRLClickForLinks(), ExcalidrawPlugin, fileShouldDefaultAsExcalidraw(), foldExcalidrawSection(), getCJKDataURLs(), getFontMetrics() (+11 more)

### Community 19 - ".slice"
Cohesion: 0.04
Nodes (77): _3(), Ah(), au(), bf(), bg(), Ca(), CH(), day() (+69 more)

### Community 20 - ".then"
Cohesion: 0.07
Nodes (73): _advanceReadiness(), all(), _binStringToArrayBuffer(), callWhenReady(), _checkBlobSupport(), _checkBlobSupportWithoutCaching(), checkIfLocalStorageThrows(), _classCallCheck() (+65 more)

### Community 21 - "handleImageRequest"
Cohesion: 0.04
Nodes (86): AI_BASE_URL_SUFFIXES, analyzeAIImage(), applyOutgoingTokenBudget(), buildGenerateAIImageResult(), buildNormalizedMessages(), cloneAIRequestMessage(), cloneAIRequestMessageContent(), createAIChatSession() (+78 more)

### Community 22 - "constructor"
Cohesion: 0.04
Nodes (75): a2(), activatePlaceholder(), applySettingsUpdate(), AR(), Ax(), bindScrollHandlers(), Bx(), calculateDragIntersect() (+67 more)

### Community 23 - "templater-obsidian/main.js"
Cohesion: 0.04
Nodes (72): additional_functions(), br(), Co(), constructor(), create_dynamic_templates(), create_static_templates(), createForm(), __destroy_into_raw() (+64 more)

### Community 24 - "DataviewApi"
Cohesion: 0.04
Nodes (39): bufferToString(), canonicalizeVarName(), Context, DataviewApi, DataviewCalendarRenderer, defaultLinkHandler(), enumerateChildren(), executeCalendar() (+31 more)

### Community 25 - "ExcalidrawData"
Cohesion: 0.05
Nodes (19): addFiles(), arrayToMap$1(), EMBEDDABLE_THEME_FRONTMATTER_VALUES, EmbeddedFile, ExcalidrawData, format(), getEmbeddedFilenameParts$1(), getEmbedFilename() (+11 more)

### Community 26 - ".onload"
Cohesion: 0.07
Nodes (9): addFields(), buildInlineFields(), DataviewPlugin, FileImporter, FullIndex, inlinePlugin(), ListItem$1, replaceInlineFieldsInLivePreview() (+1 more)

### Community 27 - "isValid"
Cohesion: 0.05
Nodes (59): add(), At(), B1(), bM(), count(), d1(), diff(), diffNow() (+51 more)

### Community 28 - "get"
Cohesion: 0.04
Nodes (71): aC(), addView(), archiveCompletedCards(), bi(), bk(), clear(), forceRefresh(), get() (+63 more)

### Community 29 - ".push"
Cohesion: 0.04
Nodes (73): addEdgeIfNotToInternal(), BS(), bySymbol(), bySymbolOrCreate(), c0(), ce(), constructExplanation(), copyStatusWithNewName() (+65 more)

### Community 30 - "get"
Cohesion: 0.07
Nodes (60): n$a, _0(), assign(), b0(), cancelledDate(), checkAndReturnWithFollowingPattern(), checkAndReturnWithoutFollowingPattern(), clone() (+52 more)

### Community 31 - "calendar/main.js"
Cohesion: 0.03
Nodes (46): activeFile, attr(), binding_callbacks, binding_callbacks$1, classList(), configureGlobalMomentLocale(), ConfirmationModal, customTagsSource (+38 more)

### Community 32 - ".forEach"
Cohesion: 0.04
Nodes (23): alphaTo(), COLOR_NAMES, ContentSearcher, download(), EmbeddableSettings, escapeRegExp(), exportPNG(), getAllWindowDocuments() (+15 more)

### Community 33 - "ScriptEngine"
Cohesion: 0.05
Nodes (13): AIUsageModal, clsx(), ExcalidrawSettingTab, HotkeyEditor, modifierLabel(), ObsidianMenu, penIcon(), r$d() (+5 more)

### Community 34 - "a"
Cohesion: 0.07
Nodes (67): p(), a(), ae(), B(), bb(), bh(), Bt(), c1() (+59 more)

### Community 35 - "getBoundingClientRect"
Cohesion: 0.07
Nodes (61): arrow(), clamp(), computeAutoPlacement(), computeOffsets(), computeStyles(), detectOverflow(), distanceAndSkiddingToXY(), effect() (+53 more)

### Community 36 - "f"
Cohesion: 0.11
Nodes (66): ki(), nF(), rF(), At(), B(), be(), bi(), bn() (+58 more)

### Community 37 - "t"
Cohesion: 0.05
Nodes (66): AC(), acquire(), applySearchBoxFilterAndRerender(), bc(), bU(), configure(), debug(), deprecate() (+58 more)

### Community 38 - "ToolsPanel"
Cohesion: 0.05
Nodes (13): checkVersionMismatch(), DropManager, getYouTubeUrl(), internalDragModifierType(), isSHIFT(), isWinALTorMacOPT(), isWinCTRLorMacCMD(), localFileDragModifierType() (+5 more)

### Community 39 - "constructor"
Cohesion: 0.05
Nodes (63): $1(), addItemForInstruction(), addItemsForInstructions(), addTaskGroup(), addTaskGroups(), addTitleRow(), B1(), buildRelative() (+55 more)

### Community 40 - "format"
Cohesion: 0.06
Nodes (61): a0(), al(), bl(), cc(), clone(), create(), cS(), dtFormatter() (+53 more)

### Community 41 - "errorlog"
Cohesion: 0.04
Nodes (42): addSVGToImgSrc(), blobToBase64(), convertSVGStringToElement(), createImageDiv(), createImgElement(), createPNG(), EmbeddedFilesLoader, errorlog() (+34 more)

### Community 42 - "Kn"
Cohesion: 0.06
Nodes (49): Al(), aq(), BD(), by(), compareTaskSortKeys(), compareTaskSortKeysIfEitherIsNull(), compareTaskSortKeysIfOptionalMoment(), connectedCallback() (+41 more)

### Community 43 - "contains"
Cohesion: 0.04
Nodes (25): CANVAS_VIEWTYPES, CanvasNodeFactory, contains(), createLeaf(), CustomEmbeddable(), EventManager, ExcalidrawLoading, EXTENDED_EVENT_TYPES (+17 more)

### Community 44 - "add"
Cohesion: 0.06
Nodes (54): add(), addAllTaskGroups(), addBacklinks(), addChildren(), addCopyButton(), addDefaultStatusTypes(), addEditButton(), addEmptyLine() (+46 more)

### Community 45 - "rgb2css"
Cohesion: 0.05
Nodes (44): Color, compand(), css2rgb(), gammaAdjustSRGB(), getLabWhitePoint(), hcl2rgb(), hsl2css(), hsl2rgb() (+36 more)

### Community 46 - "get"
Cohesion: 0.05
Nodes (48): applySubstitution(), arabicPresentationForms(), arabicRequiredLigatures(), arabicSentenceEndCheck(), arabicSentenceStartCheck(), arabicWordEndCheck(), arabicWordStartCheck(), average() (+40 more)

### Community 47 - "createFilterOrErrorMessage"
Cohesion: 0.06
Nodes (61): buildFilterFunction(), buildGroupingTree(), canCreateFilterForLine(), cL(), cleanDescription(), comparator(), createFilterOrErrorMessage(), createGrouper() (+53 more)

### Community 48 - "fe"
Cohesion: 0.07
Nodes (7): fe(), Ga(), gr(), ju(), Ku(), Pn(), qu()

### Community 49 - "y$1"
Cohesion: 0.10
Nodes (34): asyncTryOrPropagate(), createFixedListView(), createFixedTableView(), createFixedTaskView(), createListView(), createTableView(), createTaskView(), DataviewIOApi (+26 more)

### Community 50 - "screen.tsx"
Cohesion: 0.08
Nodes (29): MilharScreen(), styles, MODALIDADES, styles, IntervaloAdicionado, NUMEROS_PREMIO, PremiosScreen(), styles (+21 more)

### Community 51 - "setDynamicStyle"
Cohesion: 0.07
Nodes (46): a$c(), alpha(), alphaBy(), analyze(), b(), b$5(), bezier(), binom_row() (+38 more)

### Community 52 - "e"
Cohesion: 0.10
Nodes (46): add_syntax_highlighting_settings(), add_trigger_on_new_file_creation_setting(), append_template_to_active_file(), create_new_note_from_template(), create_running_config(), De(), desktopShouldHighlight(), disable_highlighter() (+38 more)

### Community 53 - "Link"
Cohesion: 0.06
Nodes (12): compareValue(), extractSubtags(), FunctionBuilder, getExtension(), getFileTitle(), Link, PageMetadata, parseInnerLink() (+4 more)

### Community 54 - "resolve"
Cohesion: 0.08
Nodes (44): addNamespaces(), _addQueryRenderChild(), addResource(), addResourceBundle(), addResources(), changeLanguage(), cloneInstance(), dir() (+36 more)

### Community 55 - "argument"
Cohesion: 0.06
Nodes (42): addGlyphNames(), addGlyphNamesAll(), addGlyphNamesToUnicodeMap(), argument(), buildPath(), EXCALIDRAW_EXTERNAL_GET_LABEL_KEY_SET, fail(), getContours() (+34 more)

### Community 56 - "dependencies"
Cohesion: 0.05
Nodes (40): expo, expo-application, expo-clipboard, expo-constants, expo-font, expo-haptics, expo-image, expo-linking (+32 more)

### Community 57 - "auth.ts"
Cohesion: 0.16
Nodes (27): expo-secure-store, AuthService, isJwtExpired(), LoginCredentials, LoginResponse, PermissoesPayload, TerminalPayload, VendedorPayload (+19 more)

### Community 58 - ".render"
Cohesion: 0.07
Nodes (16): asyncEvalInContext(), B$2(), currentLocale(), DataviewInlineJSRenderer, DataviewInlineRenderer, DataviewJSRenderer, DataviewRefreshableRenderer, evalInContext() (+8 more)

### Community 59 - "explainQuery"
Cohesion: 0.11
Nodes (23): allLinesIdentical(), applyFilter(), applyQueryToTasks(), applyTaskLimit(), explainDebugSettings(), explainError(), explainFilterIndented(), explainFilters() (+15 more)

### Community 60 - ".linkClick"
Cohesion: 0.05
Nodes (35): arrayToMap(), cleanBlockRef(), cleanSectionHeading(), EmbeddableMenu, emulateKeysForLinkClick(), getActivePDFPageNumberFromPDFView(), getBoundTextElementId(), _getContainerElement() (+27 more)

### Community 61 - "InlineLinkSuggester"
Cohesion: 0.11
Nodes (4): getLinkSuggestionsFiltered(), InlineLinkSuggester, renderHeadingSuggestionRow(), renderParagraphSuggestionRow()

### Community 62 - "t"
Cohesion: 0.07
Nodes (37): $2(), ag(), Av(), cleanUp(), dL(), flatMap(), formatDateTimeFromString(), formatDurationFromString() (+29 more)

### Community 63 - "display"
Cohesion: 0.06
Nodes (45): addOneSettingsBlock(), addStatus(), append(), bulkAddStatusCollection(), bx(), createFromImportedValue(), debouncedRender(), deleteAllCustomStatuses() (+37 more)

### Community 64 - "apiClient.ts"
Cohesion: 0.11
Nodes (23): PuleTermicaProps, apiCall(), ApiEnvelope, ApiError, base64UrlDecode(), CallOptions, decodeJwt(), isTokenExpiringSoon() (+15 more)

### Community 65 - "FloatingModal"
Cohesion: 0.06
Nodes (13): AUDIO_TYPES, CODE_TYPES, CropImage, exportSVG(), FileSuggestionModal, FloatingModal, InsertMDDialog, LaTexPrompt (+5 more)

### Community 66 - "toString"
Cohesion: 0.11
Nodes (20): asMarkdown(), Bq(), canSaveEdits(), getMarkdownFileInfo(), getSuggestions(), gl(), grabSuggestions(), kl() (+12 more)

### Community 67 - "LocalStorageCache"
Cohesion: 0.06
Nodes (10): flush(), IndexMap, LocalStorageCache, make_dirty(), outro_and_destroy_block(), schedule_update(), set_current_component(), Success (+2 more)

### Community 69 - "deserialize"
Cohesion: 0.08
Nodes (29): adjustRelativeLinksInDescription(), deserialize(), equals(), extractDateField(), extractField(), extractHashtags(), extractTaskComponents(), formatAsDate() (+21 more)

### Community 70 - "parseLine"
Cohesion: 0.09
Nodes (31): allSupportedDelimiters(), createListItem(), createStatementsFromExpandedPlaceholders(), expandPlaceholders(), fromInstructionLine(), getFiltersAndSimplifiedLine(), helpMessage(), helpMessageFromSimpleError() (+23 more)

### Community 72 - ".onClose"
Cohesion: 0.07
Nodes (6): CommandLinkOptInPrompt, ImportSVGDialog, InsertCommandDialog, InsertImageDialog, PublishOutOfDateFilesDialog, VersionMismatchPrompt

### Community 73 - "L$1"
Cohesion: 0.15
Nodes (19): A$2(), C$1(), children(), d$1(), F$2(), G$1(), g$2(), H$1() (+11 more)

### Community 75 - "Lexer"
Cohesion: 0.25
Nodes (4): isEmpty(), isNotAnchorChar(), Lexer, peek()

### Community 76 - "expo"
Cohesion: 0.07
Nodes (27): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, edgeToEdgeEnabled, predictiveBackGestureEnabled, reactCompiler (+19 more)

### Community 77 - "collapsible.tsx"
Cohesion: 0.12
Nodes (17): styles, ParallaxScrollView(), Props, styles, styles, ThemedText(), ThemedTextProps, ThemedView() (+9 more)

### Community 78 - "CalendarView"
Cohesion: 0.10
Nodes (10): CalendarView, clamp(), createConfirmationDialog(), get_store_value(), getDotsForDailyNote(), getWordCount(), getWordLengthAsDots(), showFileMenu() (+2 more)

### Community 79 - "format"
Cohesion: 0.08
Nodes (27): $2(), AA(), aU(), buildExplanation(), CM(), eP(), format(), formatAsDateAndTime() (+19 more)

### Community 81 - "z"
Cohesion: 0.13
Nodes (24): add_auto_jump_to_cursor(), add_file_templates_setting(), add_folder_templates_setting(), add_ignore_folders_on_creation_setting(), add_internal_functions_setting(), add_startup_templates_setting(), add_template_folder_setting(), add_template_hotkey() (+16 more)

### Community 82 - "identicalTo"
Cohesion: 0.13
Nodes (17): a1(), allDateFields(), findKeyInFrontmatter(), generateInstruction(), handleMetadataOrFilePathChange(), hasProperty(), i1(), identicalTo() (+9 more)

### Community 83 - "getDateFromFile"
Cohesion: 0.12
Nodes (23): createDailyNote(), createWeeklyNote(), ensureFolderExists(), getAllDailyNotes(), getAllWeeklyNotes(), getDailyNote(), getDailyNoteSettings(), getDateFromFile() (+15 more)

### Community 84 - "sanitizeSvgTree"
Cohesion: 0.11
Nodes (22): applyDefaultSvgTheme(), BLOCKED_SVG_TAGS, createTreeWalker(), cssTextToReactStyle(), domNodeToReact(), excalidrawSword(), getIconAsJSX(), isUnsafeAttribute() (+14 more)

### Community 85 - "Fe"
Cohesion: 0.13
Nodes (23): UO(), Bo(), ci(), closing_tag(), cr(), dn(), Fe(), Fo() (+15 more)

### Community 86 - "init$1"
Cohesion: 0.08
Nodes (27): add_render_callback$1(), bind(), blank_object$1(), Calendar, children$1(), component_subscribe(), create_fragment(), destroy_component$1() (+19 more)

### Community 87 - "dW"
Cohesion: 0.11
Nodes (22): addRow(), addRowIfNew(), allStatuses(), applyToStatusRegistry(), Cg(), cW(), cx(), dW() (+14 more)

### Community 88 - "AuthContext.tsx"
Cohesion: 0.17
Nodes (13): PreviewScreen(), PUBLIC_ROUTES, RootLayoutNav(), LoginScreen(), styles, HomeScreen(), AuthContext, AuthContextType (+5 more)

### Community 89 - "update"
Cohesion: 0.12
Nodes (16): add_render_callback(), appHasPeriodicNotesPluginLoaded(), CalendarPlugin, check_outros(), createDailyNotesStore(), createSelectedFileStore(), createWeeklyNotesStore(), detach() (+8 more)

### Community 90 - "parseCFFTable"
Cohesion: 0.14
Nodes (21): calcCFFSubroutineBias(), entriesToObject(), gatherCFFTopDicts(), getByte(), getBytes(), getCffIndexObject(), getCFFString(), getOffset() (+13 more)

### Community 91 - ".handleError"
Cohesion: 0.17
Nodes (4): ErrorHandler, PackageManager, unpackExcalidraw(), updateExcalidrawLib()

### Community 92 - "devDependencies"
Cohesion: 0.11
Nodes (20): eslint, eslint-config-expo, jest, jest-expo, devDependencies, eslint, eslint-config-expo, jest (+12 more)

### Community 93 - "path"
Cohesion: 0.10
Nodes (19): addStringToPool(), calculateDimensions(), calculatePosition(), exportToPDF(), findSubArray(), getClientPoint(), getEncoding(), getLanguageCode() (+11 more)

### Community 94 - "init"
Cohesion: 0.08
Nodes (32): add_css(), add_css$1(), add_css$2(), add_css$3(), add_css$4(), add_css$5(), append(), Arrow (+24 more)

### Community 95 - "userIgnoreFilters"
Cohesion: 0.12
Nodes (16): userIgnoreFilters, android/, build/, coverage/, dist/, .expo, .expo-shared, .git (+8 more)

### Community 96 - "create_default_slot$1"
Cohesion: 0.14
Nodes (17): assign(), create_default_slot(), create_default_slot$1(), create_each_block(), create_each_block$1(), create_each_block$2(), create_fragment$1(), create_if_block() (+9 more)

### Community 97 - "create_if_block$1"
Cohesion: 0.14
Nodes (16): create_catch_block(), create_else_block(), create_fragment$5(), create_if_block$1(), create_pending_block(), create_slot(), create_then_block(), get_current_component() (+8 more)

### Community 98 - "diagramToHTML"
Cohesion: 0.14
Nodes (14): diagramToHTML(), errorHTML(), extractDiagramHTML(), getDataURL(), getDiagramToHTMLFinishReason(), getFontDataURL(), getFontDataURL$1(), getJsonErrorMessage() (+6 more)

### Community 100 - ".toString"
Cohesion: 0.15
Nodes (14): buildMultipartFormBody(), concatUint8Arrays(), createSliderWithText(), getInternalLinkOrFileURLLink(), hex(), intIdentify(), intIdentify$2(), intStringify() (+6 more)

### Community 101 - "templater-obsidian/manifest.json"
Cohesion: 0.13
Nodes (14): author, authorUrl, description, fundingUrl, GitHub Sponser (SilentVoid13, creator), GitHub Sponser (Zachatoo, maintainer), Ko-fi (Zachatoo, maintainer), Paypal (SilentVoid13, creator) (+6 more)

### Community 102 - "scripts"
Cohesion: 0.13
Nodes (14): main, name, private, scripts, android, ios, lint, reset-project (+6 more)

### Community 103 - "jest"
Cohesion: 0.11
Nodes (20): global, branches, lines, statements, jest, collectCoverageFrom, coverageThreshold, moduleNameMapper (+12 more)

### Community 104 - "parseDocument"
Cohesion: 0.19
Nodes (8): Composer, end(), getErrorPos(), parse(), parseDocument(), parseOptions(), parsePrelude(), prettifyError()

### Community 107 - "xi"
Cohesion: 0.27
Nodes (10): gT(), hT(), Jr(), kr(), My(), qt(), rA(), v1() (+2 more)

### Community 108 - "instance$7"
Cohesion: 0.21
Nodes (8): Calendar$1, create_each_block_3(), create_fragment$7(), get_each_context(), get_each_context_3(), getDaysOfWeek(), getMonth(), instance$7()

### Community 110 - "SvelteComponent"
Cohesion: 0.33
Nodes (3): destroy_component(), is_empty(), SvelteComponent

### Community 111 - "u$1"
Cohesion: 0.47
Nodes (6): a$3(), c$3(), i$3(), o$3(), r$3(), u$1()

### Community 112 - "setupDragAndDrop"
Cohesion: 0.24
Nodes (12): calculateDropPosition(), clearDropIndicator(), clearDropIndicators(), createAddNewPresetButton(), getTargetIndex(), renderPresetItem(), renderPresetsSettings(), savePresetsSettings() (+4 more)

### Community 113 - "include"
Cohesion: 0.17
Nodes (11): expo-env.d.ts, expo/tsconfig.base, .expo/types/**/*.ts, **/*.ts, **/*.tsx, compilerOptions, jsx, paths (+3 more)

### Community 115 - "blockString"
Cohesion: 0.42
Nodes (11): blockString(), consumeMoreIndentedLines(), containsDocumentMarker(), doubleQuotedString(), foldFlowLines(), getFoldOptions(), lineLengthOverLimit(), plainString() (+3 more)

### Community 116 - "obsidian-excalidraw-plugin/manifest.json"
Cohesion: 0.18
Nodes (10): author, authorUrl, description, fundingUrl, helpUrl, id, isDesktopOnly, minAppVersion (+2 more)

### Community 117 - "obsidian-tasks-plugin/manifest.json"
Cohesion: 0.18
Nodes (10): author, authorUrl, description, fundingUrl, helpUrl, id, isDesktopOnly, minAppVersion (+2 more)

### Community 118 - "extractInlineFields"
Cohesion: 0.11
Nodes (13): CsvCache, extractInlineFields(), extractSpecialTaskFields(), findClosing(), findSeparator(), findSpecificInlineField(), setEmojiShorthandCompletionField(), setInlineField() (+5 more)

### Community 119 - "FixedOffsetZone"
Cohesion: 0.04
Nodes (9): FixedOffsetZone, formatOffset(), hackyOffset(), IANAZone, makeDTF(), parseZoneInfo(), partsOffset(), Settings (+1 more)

### Community 121 - "dataview/manifest.json"
Cohesion: 0.20
Nodes (9): author, authorUrl, description, helpUrl, id, isDesktopOnly, minAppVersion, name (+1 more)

### Community 122 - "addName"
Cohesion: 0.67
Nodes (4): addName(), makeFvarAxis(), makeFvarInstance(), makeFvarTable()

### Community 123 - ".addArrow"
Cohesion: 0.24
Nodes (7): estimateBounds(), estimateLineBound(), getLineBox(), normalizeBindMode(), normalizeFixedPoint(), normalizeLinePoints(), repositionElementsToCursor()

### Community 125 - "obsidian-kanban/manifest.json"
Cohesion: 0.20
Nodes (9): author, authorUrl, description, helpUrl, id, isDesktopOnly, minAppVersion, name (+1 more)

### Community 126 - "calendar/manifest.json"
Cohesion: 0.22
Nodes (8): author, authorUrl, description, id, isDesktopOnly, minAppVersion, name, version

### Community 127 - ".toMessage"
Cohesion: 0.22
Nodes (4): Invalid, InvalidDateTimeError, InvalidDurationError, InvalidIntervalError

### Community 130 - "CarrinhoContext.tsx"
Cohesion: 0.36
Nodes (6): ModalidadesScreen(), CarrinhoContext, CarrinhoContextData, CarrinhoProvider(), useCarrinho(), ApostaItem

### Community 131 - "encryptStoredAPIKey"
Cohesion: 0.32
Nodes (8): decodeBase64(), decodeObfuscatedAPIKeyPayload(), encryptPersistedAPIKeys(), encryptProviderProfiles(), encryptStoredAPIKey(), isEncryptedStoredAPIKey(), isObfuscatedAPIKey(), xorWithSecret()

### Community 132 - "reset-project.js"
Cohesion: 0.25
Nodes (6): exampleDirPath, fs, oldDirs, readline, rl, root

### Community 133 - "d$1"
Cohesion: 0.33
Nodes (7): c$8(), d$1(), f$1(), i$8(), p$1(), s$8(), u$6()

### Community 134 - "plugins"
Cohesion: 0.33
Nodes (4): plugins, Props, expo-web-browser, expo-web-browser

## Knowledge Gaps
- **502 isolated node(s):** `.git`, `.expo`, `.expo-shared`, `build/`, `coverage/` (+497 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `p()` connect `a` to `dataview/main.js`, `e`, `fromObject`, `n`, `e`, `l`, `.slice`, `templater-obsidian/main.js`, `DataviewApi`, `.onload`, `isValid`, `f`, `constructor`, `format`, `y$1`, `resolve`, `t`, `display`, `toString`, `format`, `z`, `Fe`, `xi`?**
  _High betweenness centrality (0.228) - this node is a cross-community bridge._
- **Why does `SegmentChainer$1()` connect `e` to `obsidian-excalidraw-plugin/main.js`, `.forEach`, `a`, `f`, `.push`, `ExcalidrawAutomate`, `l`, `setDynamicStyle`, `argument`?**
  _High betweenness centrality (0.143) - this node is a cross-community bridge._
- **Why does `ExcalidrawAutomate` connect `ExcalidrawAutomate` to `obsidian-excalidraw-plugin/main.js`, `e`, `ExcalidrawView`, `.push`, `Document`, `t$d`, `.registerCommands`, `e`, `ExcalidrawPlugin`, `handleImageRequest`, `ExcalidrawData`, `.forEach`, `ScriptEngine`, `getBoundingClientRect`, `errorlog`, `contains`, `rgb2css`, `get`, `setDynamicStyle`, `argument`, `.linkClick`, `InlineLinkSuggester`, `FloatingModal`, `ExcalidrawSidepanelView`, `Lexer`, `GenericInputPrompt`, `sanitizeSvgTree`, `parseCFFTable`, `.handleError`, `path`, `diagramToHTML`, `.toString`, `parseDocument`, `GenericSuggester`, `blockString`, `addName`, `.addArrow`, `Suggester`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Are the 90 inferred relationships involving `e()` (e.g. with `a$9()` and `.render()`) actually correct?**
  _`e()` has 90 INFERRED edges - model-reasoned connections that need verification._
- **Are the 81 inferred relationships involving `n()` (e.g. with `aS()` and `bO()`) actually correct?**
  _`n()` has 81 INFERRED edges - model-reasoned connections that need verification._
- **Are the 78 inferred relationships involving `r()` (e.g. with `ba()` and `bO()`) actually correct?**
  _`r()` has 78 INFERRED edges - model-reasoned connections that need verification._
- **What connects `.git`, `.expo`, `.expo-shared` to the rest of the system?**
  _502 weakly-connected nodes found - possible documentation gaps or missing edges._