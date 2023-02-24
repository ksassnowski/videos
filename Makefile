build: scripts/build
	scripts/build $(project)

clean-output:
	rm -rf output/

clean-videos:
	rm -rf videos

clean-all: clean-videos clean-output