import unittest

from scripts.aggregate import aggregate_run


class AggregateRunTests(unittest.TestCase):
    def setUp(self):
        self.tracker = {
            "project": {"name": "Acme", "aliases": ["acme"], "domains": ["acme.test"]},
            "competitors": [{"name": "Rival", "aliases": ["rival"], "domains": ["rival.test"]}],
            "prompts": [{"id": "active", "text": "Which tool?"}],
        }

    def test_ignores_results_from_retired_engines(self):
        run = {
            "engines": [
                {"id": "live", "status": "live"},
                {"id": "retired", "status": "awaiting_key"},
            ],
            "results": {
                "active": {
                    "live": {"runs": [{
                        "mentioned": True,
                        "cited": False,
                        "position": 1,
                        "competitors_mentioned": [],
                    }]},
                    "retired": {"runs": [{
                        "mentioned": False,
                        "cited": False,
                        "position": None,
                        "competitors_mentioned": ["Rival"],
                    }]},
                }
            },
        }

        result = aggregate_run(run, self.tracker)

        self.assertEqual(result["overall"]["samples"], 1)
        self.assertEqual(result["overall"]["mention_rate"], 1.0)
        self.assertEqual(set(result["by_engine"]), {"live"})

    def test_ignores_historical_results_for_removed_prompts(self):
        run = {
            "engines": [{"id": "live", "status": "live"}],
            "results": {
                "removed": {"live": {"runs": [{
                    "mentioned": True,
                    "cited": True,
                    "position": 1,
                    "competitors_mentioned": [],
                }]}}
            },
        }

        result = aggregate_run(run, self.tracker)

        self.assertEqual(result["per_prompt"], [])
        self.assertEqual(result["overall"]["samples"], 0)


if __name__ == "__main__":
    unittest.main()
