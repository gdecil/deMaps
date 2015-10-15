        var the = {
            use_codemirror: (!window.location.href.match(/without-codemirror/)),
            beautify_in_progress: false,
            editor: null // codemirror editor
        };

        function any(a, b) {
            return a || b;
        }

        function read_settings_from_cookie() {
            $('#tabsize').val(any($.cookie('tabsize'), '4'));
            $('#brace-style').val(any($.cookie('brace-style'), 'collapse'));
            $('#detect-packers').prop('checked', $.cookie('detect-packers') !== 'off');
            $('#max-preserve-newlines').val(any($.cookie('max-preserve-newlines'), '5'));
            $('#keep-array-indentation').prop('checked', $.cookie('keep-array-indentation') === 'on');
            $('#break-chained-methods').prop('checked', $.cookie('break-chained-methods') === 'on');
            $('#indent-scripts').val(any($.cookie('indent-scripts'), 'normal'));
            $('#space-before-conditional').prop('checked', $.cookie('space-before-conditional') !== 'off');
            $('#wrap-line-length').val(any($.cookie('wrap-line-length'), '0'));
            $('#unescape-strings').prop('checked', $.cookie('unescape-strings') === 'on');
            $('#jslint-happy').prop('checked', $.cookie('jslint-happy') === 'on');
            $('#end-with-newline').prop('checked', $.cookie('end-with-newline') === 'on');
            $('#indent-inner-html').prop('checked', $.cookie('indent-inner-html') === 'on');
            $('#comma-first').prop('checked', $.cookie('comma-first') === 'on');
            $('#e4x').prop('checked', $.cookie('e4x') === 'on');
        }

        function store_settings_to_cookie() {
            var opts = {
                expires: 360
            };
            $.cookie('tabsize', $('#tabsize').val(), opts);
            $.cookie('brace-style', $('#brace-style').val(), opts);
            $.cookie('detect-packers', $('#detect-packers').prop('checked') ? 'on' : 'off', opts);
            $.cookie('max-preserve-newlines', $('#max-preserve-newlines').val(), opts);
            $.cookie('keep-array-indentation', $('#keep-array-indentation').prop('checked') ? 'on' : 'off', opts);
            $.cookie('break-chained-methods', $('#break-chained-methods').prop('checked') ? 'on' : 'off', opts);
            $.cookie('space-before-conditional', $('#space-before-conditional').prop('checked') ? 'on' : 'off',
                opts);
            $.cookie('unescape-strings', $('#unescape-strings').prop('checked') ? 'on' : 'off', opts);
            $.cookie('jslint-happy', $('#jslint-happy').prop('checked') ? 'on' : 'off', opts);
            $.cookie('end-with-newline', $('#end-with-newline').prop('checked') ? 'on' : 'off', opts);
            $.cookie('wrap-line-length', $('#wrap-line-length').val(), opts);
            $.cookie('indent-scripts', $('#indent-scripts').val(), opts);
            $.cookie('indent-inner-html', $('#indent-inner-html').prop('checked') ? 'on' : 'off', opts);
            $.cookie('comma-first', $('#comma-first').prop('checked') ? 'on' : 'off', opts);
            $.cookie('e4x', $('#e4x').prop('checked') ? 'on' : 'off', opts);

        }


        function beautify() {
            if (the.beautify_in_progress) return;

            store_settings_to_cookie();

            the.beautify_in_progress = true;

            var source = the.editor ? the.editor.getValue() : $('#source').val(),
                output,
                opts = {};

            opts.indent_size = $('#tabsize').val();
            opts.indent_char = opts.indent_size == 1 ? '\t' : ' ';
            opts.max_preserve_newlines = $('#max-preserve-newlines').val();
            opts.preserve_newlines = opts.max_preserve_newlines !== "-1";
            opts.keep_array_indentation = $('#keep-array-indentation').prop('checked');
            opts.break_chained_methods = $('#break-chained-methods').prop('checked');
            opts.indent_scripts = $('#indent-scripts').val();
            opts.brace_style = $('#brace-style').val();
            opts.space_before_conditional = $('#space-before-conditional').prop('checked');
            opts.unescape_strings = $('#unescape-strings').prop('checked');
            opts.jslint_happy = $('#jslint-happy').prop('checked');
            opts.end_with_newline = $('#end-with-newline').prop('checked');
            opts.wrap_line_length = $('#wrap-line-length').val();
            opts.indent_inner_html = $('#indent-inner-html').prop('checked');
            opts.comma_first = $('#comma-first').prop('checked');
            opts.e4x = $('#e4x').prop('checked');

            if (looks_like_html(source)) {
                output = html_beautify(source, opts);
            } else {
                if ($('#detect-packers').prop('checked')) {
                    source = unpacker_filter(source);
                }
                output = js_beautify(source, opts);
            }
            if (the.editor) {
                the.editor.setValue(output);
            } else {
                $('#source').val(output);
            }

            the.beautify_in_progress = false;
        }

        function looks_like_html(source) {
            // <foo> - looks like html
            // <!--\nalert('foo!');\n--> - doesn't look like html

            var trimmed = source.replace(/^[ \t\n\r]+/, '');
            var comment_mark = '<' + '!-' + '-';
            return (trimmed && (trimmed.substring(0, 1) === '<' && trimmed.substring(0, 4) !== comment_mark));
        }

        $(function () {

  //          read_settings_from_cookie();

            var default_text =
                "// This is just a sample script. Paste your real code (javascript or HTML) here.\n\nif ('this_is'==/an_example/){of_beautifer();}else{var a=b?(c%d):e[f];}";
            var textArea = $('#source')[0];

            if (the.use_codemirror && typeof CodeMirror !== 'undefined') {
                the.editor = CodeMirror.fromTextArea(textArea, {
                        theme: 'default',
                        lineNumbers: true
                    });
                the.editor.focus();

                the.editor.setValue(default_text);
                $('.CodeMirror').click(function () {
                    if (the.editor.getValue() == default_text) {
                        the.editor.setValue('');
                    }
                });
            } else {
                $('#source').val(default_text).bind('click focus', function () {
                    if ($(this).val() == default_text) {
                        $(this).val('');
                    }
                }).bind('blur', function () {
                    if (!$(this).val()) {
                        $(this).val(default_text);
                    }
                });
            }


            $(window).bind('keydown', function (e) {
                if (e.ctrlKey && e.keyCode == 13) {
                    beautify();
                }
            })
            $('.submit').click(beautify);
            $('select').change(beautify);


        });
